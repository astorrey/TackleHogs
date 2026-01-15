import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedData {
  name?: string;
  brand?: string;
  model?: string;
  description?: string;
  price?: string;
  image?: string;
  specifications?: Record<string, string>;
  source?: string;
}

// Retailer-specific scrapers
const scrapers: Record<string, (html: string, $: cheerio.CheerioAPI) => ScrapedData> = {
  // Bass Pro Shops
  'basspro.com': (html, $) => {
    const data: ScrapedData = { source: 'Bass Pro Shops' };
    
    // Product name
    data.name = $('h1.product-name, h1[itemprop="name"]').first().text().trim();
    
    // Brand
    data.brand = $('.product-brand, .brand-name').first().text().trim();
    
    // Price
    data.price = $('.product-price .price, .sale-price').first().text().trim();
    
    // Description
    data.description = $('.product-description, #productDescription').first().text().trim().slice(0, 500);
    
    // Image
    data.image = $('img.product-image, img[itemprop="image"]').first().attr('src') ||
                 $('meta[property="og:image"]').attr('content');
    
    // Specifications
    const specs: Record<string, string> = {};
    $('.product-specs tr, .specifications tr').each((_, el) => {
      const key = $(el).find('th, td:first-child').text().trim();
      const value = $(el).find('td:last-child').text().trim();
      if (key && value) specs[key] = value;
    });
    if (Object.keys(specs).length > 0) data.specifications = specs;
    
    return data;
  },

  // Cabela's
  'cabelas.com': (html, $) => {
    const data: ScrapedData = { source: "Cabela's" };
    
    data.name = $('h1.product-name, h1[itemprop="name"]').first().text().trim();
    data.brand = $('.product-brand, .brand-name').first().text().trim();
    data.price = $('.product-price .price, .sale-price').first().text().trim();
    data.description = $('.product-description').first().text().trim().slice(0, 500);
    data.image = $('img.product-image').first().attr('src') ||
                 $('meta[property="og:image"]').attr('content');
    
    const specs: Record<string, string> = {};
    $('.product-specs tr').each((_, el) => {
      const key = $(el).find('th').text().trim();
      const value = $(el).find('td').text().trim();
      if (key && value) specs[key] = value;
    });
    if (Object.keys(specs).length > 0) data.specifications = specs;
    
    return data;
  },

  // Amazon
  'amazon.com': (html, $) => {
    const data: ScrapedData = { source: 'Amazon' };
    
    data.name = $('#productTitle, #title').first().text().trim();
    data.brand = $('#bylineInfo, .brand').first().text().replace('Brand:', '').trim();
    data.price = $('.a-price .a-offscreen, #priceblock_ourprice, #priceblock_dealprice').first().text().trim();
    data.description = $('#productDescription p, #feature-bullets li').map((_, el) => $(el).text().trim()).get().join(' ').slice(0, 500);
    data.image = $('#landingImage, #imgBlkFront').first().attr('src') ||
                 $('meta[property="og:image"]').attr('content');
    
    const specs: Record<string, string> = {};
    $('#productDetails_techSpec_section_1 tr, #productDetails_detailBullets_sections1 tr').each((_, el) => {
      const key = $(el).find('th').text().trim();
      const value = $(el).find('td').text().trim();
      if (key && value) specs[key] = value;
    });
    if (Object.keys(specs).length > 0) data.specifications = specs;
    
    return data;
  },

  // Tackle Warehouse
  'tacklewarehouse.com': (html, $) => {
    const data: ScrapedData = { source: 'Tackle Warehouse' };
    
    data.name = $('h1.product-name, .product-title h1').first().text().trim();
    data.brand = $('.product-brand, .manufacturer').first().text().trim();
    data.price = $('.product-price, .price').first().text().trim();
    data.description = $('.product-description, .description').first().text().trim().slice(0, 500);
    data.image = $('.product-image img, .main-image img').first().attr('src') ||
                 $('meta[property="og:image"]').attr('content');
    
    const specs: Record<string, string> = {};
    $('.specifications tr, .product-specs tr').each((_, el) => {
      const key = $(el).find('td:first-child').text().trim();
      const value = $(el).find('td:last-child').text().trim();
      if (key && value && key !== value) specs[key] = value;
    });
    if (Object.keys(specs).length > 0) data.specifications = specs;
    
    return data;
  },

  // Academy Sports
  'academy.com': (html, $) => {
    const data: ScrapedData = { source: 'Academy Sports' };
    
    data.name = $('h1.product-name, h1[data-auid="product-name"]').first().text().trim();
    data.brand = $('.product-brand, .brand-name').first().text().trim();
    data.price = $('.price, .product-price').first().text().trim();
    data.description = $('.product-description').first().text().trim().slice(0, 500);
    data.image = $('img.product-image').first().attr('src') ||
                 $('meta[property="og:image"]').attr('content');
    
    return data;
  },
};

// Generic scraper using Open Graph and common patterns
function genericScraper(html: string, $: cheerio.CheerioAPI): ScrapedData {
  const data: ScrapedData = { source: 'Unknown' };
  
  // Try Open Graph tags first
  data.name = $('meta[property="og:title"]').attr('content') ||
              $('meta[name="title"]').attr('content') ||
              $('title').text().trim();
  
  data.description = $('meta[property="og:description"]').attr('content') ||
                     $('meta[name="description"]').attr('content');
  
  data.image = $('meta[property="og:image"]').attr('content') ||
               $('meta[name="twitter:image"]').attr('content');
  
  // Try common product selectors
  if (!data.name || data.name.length < 5) {
    data.name = $('h1').first().text().trim() ||
                $('.product-title, .product-name').first().text().trim();
  }
  
  // Try to extract brand from name
  if (data.name && !data.brand) {
    const nameParts = data.name.split(/[-–|]/);
    if (nameParts.length > 1) {
      data.brand = nameParts[0].trim();
      data.model = nameParts.slice(1).join(' ').trim();
    }
  }
  
  // Try to find price
  data.price = $('.price, .product-price, [class*="price"]').first().text().trim();
  
  // Clean up
  if (data.description) {
    data.description = data.description.slice(0, 500);
  }
  
  return data;
}

function getScraperForUrl(url: string): (html: string, $: cheerio.CheerioAPI) => ScrapedData {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    
    for (const [domain, scraper] of Object.entries(scrapers)) {
      if (hostname.includes(domain)) {
        return scraper;
      }
    }
  } catch (e) {
    console.error('Error parsing URL:', e);
  }
  
  return genericScraper;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the webpage with a browser-like user agent
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch URL: ${response.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Get the appropriate scraper
    const scraper = getScraperForUrl(url);
    const scrapedData = scraper(html, $);
    
    // Clean up empty values
    Object.keys(scrapedData).forEach((key) => {
      const value = scrapedData[key as keyof ScrapedData];
      if (value === '' || value === null || value === undefined) {
        delete scrapedData[key as keyof ScrapedData];
      }
    });

    // Ensure image URL is absolute
    if (scrapedData.image && !scrapedData.image.startsWith('http')) {
      scrapedData.image = new URL(scrapedData.image, url).href;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: scrapedData,
        url: url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Scraping error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
