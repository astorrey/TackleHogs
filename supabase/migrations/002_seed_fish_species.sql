-- Seed fish species database with common North American fish
-- Images will be served from Supabase Storage bucket 'fish-images'

-- Add rarity column for points calculation
ALTER TABLE public.fish_species ADD COLUMN IF NOT EXISTS rarity INTEGER DEFAULT 3 CHECK (rarity >= 1 AND rarity <= 5);
-- 1 = Very Common, 2 = Common, 3 = Moderate, 4 = Uncommon, 5 = Rare

-- Add average_weight for points normalization
ALTER TABLE public.fish_species ADD COLUMN IF NOT EXISTS average_weight DECIMAL(8, 2);

-- Add description for fish details
ALTER TABLE public.fish_species ADD COLUMN IF NOT EXISTS description TEXT;

-- Insert common North American fish species
INSERT INTO public.fish_species (common_name, scientific_name, image_url, rarity, average_weight, description) VALUES
-- Bass (Freshwater)
('Largemouth Bass', 'Micropterus salmoides', 'fish-images/largemouth-bass.jpg', 1, 4.0, 'The most popular game fish in North America, known for its aggressive strikes and fighting spirit.'),
('Smallmouth Bass', 'Micropterus dolomieu', 'fish-images/smallmouth-bass.jpg', 2, 3.0, 'Prized for their fighting ability, smallmouth bass prefer cooler, clearer waters than their largemouth cousins.'),
('Spotted Bass', 'Micropterus punctulatus', 'fish-images/spotted-bass.jpg', 2, 2.5, 'Similar to largemouth but with rows of spots below the lateral line.'),
('Striped Bass', 'Morone saxatilis', 'fish-images/striped-bass.jpg', 3, 15.0, 'A powerful anadromous fish that can be found in both fresh and saltwater.'),
('White Bass', 'Morone chrysops', 'fish-images/white-bass.jpg', 2, 2.0, 'Schooling fish known for their spring spawning runs.'),
('Rock Bass', 'Ambloplites rupestris', 'fish-images/rock-bass.jpg', 1, 0.5, 'A smaller panfish with distinctive red eyes.'),

-- Trout & Salmon
('Rainbow Trout', 'Oncorhynchus mykiss', 'fish-images/rainbow-trout.jpg', 2, 3.0, 'Colorful and acrobatic, one of the most sought-after trout species.'),
('Brown Trout', 'Salmo trutta', 'fish-images/brown-trout.jpg', 3, 4.0, 'A wary, challenging fish originally from Europe.'),
('Brook Trout', 'Salvelinus fontinalis', 'fish-images/brook-trout.jpg', 3, 1.5, 'A beautiful native char with distinctive markings.'),
('Lake Trout', 'Salvelinus namaycush', 'fish-images/lake-trout.jpg', 3, 10.0, 'Deep-water dwellers that can grow to impressive sizes.'),
('Cutthroat Trout', 'Oncorhynchus clarkii', 'fish-images/cutthroat-trout.jpg', 3, 2.0, 'Named for the red slash marks under their jaw.'),
('Golden Trout', 'Oncorhynchus aguabonita', 'fish-images/golden-trout.jpg', 5, 1.0, 'A rare and beautiful high-altitude trout.'),
('Steelhead', 'Oncorhynchus mykiss', 'fish-images/steelhead.jpg', 4, 8.0, 'The anadromous form of rainbow trout, prized for their fighting ability.'),
('Chinook Salmon', 'Oncorhynchus tshawytscha', 'fish-images/chinook-salmon.jpg', 4, 20.0, 'The largest Pacific salmon, also known as King Salmon.'),
('Coho Salmon', 'Oncorhynchus kisutch', 'fish-images/coho-salmon.jpg', 3, 10.0, 'Known as Silver Salmon, popular for their acrobatic fights.'),
('Sockeye Salmon', 'Oncorhynchus nerka', 'fish-images/sockeye-salmon.jpg', 4, 6.0, 'Famous for their bright red spawning color.'),
('Pink Salmon', 'Oncorhynchus gorbuscha', 'fish-images/pink-salmon.jpg', 2, 4.0, 'The smallest and most abundant Pacific salmon.'),
('Atlantic Salmon', 'Salmo salar', 'fish-images/atlantic-salmon.jpg', 4, 12.0, 'The king of game fish in the Atlantic region.'),

-- Panfish
('Bluegill', 'Lepomis macrochirus', 'fish-images/bluegill.jpg', 1, 0.5, 'America''s favorite panfish, great for beginners.'),
('Pumpkinseed', 'Lepomis gibbosus', 'fish-images/pumpkinseed.jpg', 1, 0.3, 'A colorful sunfish with distinctive orange spots.'),
('Redear Sunfish', 'Lepomis microlophus', 'fish-images/redear-sunfish.jpg', 2, 0.75, 'Also known as shellcracker for their diet of snails.'),
('Green Sunfish', 'Lepomis cyanellus', 'fish-images/green-sunfish.jpg', 1, 0.4, 'An aggressive panfish found throughout North America.'),
('Longear Sunfish', 'Lepomis megalotis', 'fish-images/longear-sunfish.jpg', 2, 0.3, 'Named for their elongated ear flap.'),
('Warmouth', 'Lepomis gulosus', 'fish-images/warmouth.jpg', 2, 0.5, 'A bass-like sunfish that prefers weedy areas.'),
('Black Crappie', 'Pomoxis nigromaculatus', 'fish-images/black-crappie.jpg', 2, 1.0, 'Popular panfish known for schooling behavior.'),
('White Crappie', 'Pomoxis annularis', 'fish-images/white-crappie.jpg', 2, 1.0, 'Slightly more tolerant of turbid water than black crappie.'),
('Yellow Perch', 'Perca flavescens', 'fish-images/yellow-perch.jpg', 1, 0.5, 'Excellent table fare, popular ice fishing target.'),

-- Catfish
('Channel Catfish', 'Ictalurus punctatus', 'fish-images/channel-catfish.jpg', 1, 5.0, 'The most widely distributed catfish in North America.'),
('Blue Catfish', 'Ictalurus furcatus', 'fish-images/blue-catfish.jpg', 3, 20.0, 'The largest catfish species in North America.'),
('Flathead Catfish', 'Pylodictis olivaris', 'fish-images/flathead-catfish.jpg', 3, 25.0, 'A solitary predator that prefers live bait.'),
('Bullhead Catfish', 'Ameiurus nebulosus', 'fish-images/bullhead-catfish.jpg', 1, 1.0, 'Hardy catfish that tolerates poor water quality.'),
('White Catfish', 'Ameiurus catus', 'fish-images/white-catfish.jpg', 2, 3.0, 'Smaller catfish popular in the eastern US.'),

-- Pike & Muskie
('Northern Pike', 'Esox lucius', 'fish-images/northern-pike.jpg', 2, 8.0, 'An aggressive predator with razor-sharp teeth.'),
('Muskellunge', 'Esox masquinongy', 'fish-images/muskellunge.jpg', 5, 20.0, 'The fish of 10,000 casts - rare and challenging to catch.'),
('Tiger Muskie', 'Esox masquinongy x lucius', 'fish-images/tiger-muskie.jpg', 4, 15.0, 'A sterile hybrid between muskie and northern pike.'),
('Chain Pickerel', 'Esox niger', 'fish-images/chain-pickerel.jpg', 2, 2.0, 'Smaller pike relative with chain-like markings.'),
('Grass Pickerel', 'Esox americanus', 'fish-images/grass-pickerel.jpg', 2, 0.5, 'The smallest member of the pike family.'),

-- Walleye & Sauger
('Walleye', 'Sander vitreus', 'fish-images/walleye.jpg', 2, 4.0, 'Prized for excellent taste and challenging fishing.'),
('Sauger', 'Sander canadensis', 'fish-images/sauger.jpg', 3, 2.0, 'Smaller cousin of walleye, often found in rivers.'),
('Saugeye', 'Sander vitreus x canadensis', 'fish-images/saugeye.jpg', 3, 3.0, 'A popular stocked hybrid of walleye and sauger.'),

-- Carp & Suckers
('Common Carp', 'Cyprinus carpio', 'fish-images/common-carp.jpg', 1, 15.0, 'Powerful fighters popular in European-style fishing.'),
('Grass Carp', 'Ctenopharyngodon idella', 'fish-images/grass-carp.jpg', 3, 20.0, 'Herbivorous carp used for aquatic weed control.'),
('Buffalo Fish', 'Ictiobus cyprinellus', 'fish-images/buffalo-fish.jpg', 2, 10.0, 'Large native sucker often mistaken for carp.'),
('White Sucker', 'Catostomus commersonii', 'fish-images/white-sucker.jpg', 1, 2.0, 'Common bottom feeder found throughout North America.'),

-- Gar
('Longnose Gar', 'Lepisosteus osseus', 'fish-images/longnose-gar.jpg', 3, 5.0, 'Ancient fish with distinctive long snout.'),
('Spotted Gar', 'Lepisosteus oculatus', 'fish-images/spotted-gar.jpg', 3, 4.0, 'Smaller gar with dark spots on body and fins.'),
('Alligator Gar', 'Atractosteus spatula', 'fish-images/alligator-gar.jpg', 4, 100.0, 'One of the largest freshwater fish in North America.'),
('Shortnose Gar', 'Lepisosteus platostomus', 'fish-images/shortnose-gar.jpg', 3, 3.0, 'The smallest gar species.'),

-- Freshwater Drum & Others
('Freshwater Drum', 'Aplodinotus grunniens', 'fish-images/freshwater-drum.jpg', 2, 5.0, 'Also known as sheepshead, makes drumming sounds.'),
('Bowfin', 'Amia calva', 'fish-images/bowfin.jpg', 3, 5.0, 'A living fossil and fierce fighter.'),
('Burbot', 'Lota lota', 'fish-images/burbot.jpg', 4, 4.0, 'The only freshwater cod, excellent eating.'),

-- Saltwater - Inshore
('Redfish', 'Sciaenops ocellatus', 'fish-images/redfish.jpg', 2, 10.0, 'Also known as Red Drum, a premier inshore gamefish.'),
('Speckled Trout', 'Cynoscion nebulosus', 'fish-images/speckled-trout.jpg', 2, 3.0, 'Popular inshore species also called Spotted Seatrout.'),
('Flounder', 'Paralichthys lethostigma', 'fish-images/flounder.jpg', 2, 4.0, 'Flatfish that lies on the bottom waiting for prey.'),
('Snook', 'Centropomus undecimalis', 'fish-images/snook.jpg', 3, 12.0, 'A prized inshore gamefish of Florida waters.'),
('Tarpon', 'Megalops atlanticus', 'fish-images/tarpon.jpg', 4, 80.0, 'The Silver King - one of the most spectacular gamefish.'),
('Bonefish', 'Albula vulpes', 'fish-images/bonefish.jpg', 4, 6.0, 'The Grey Ghost of the flats, a fly fishing favorite.'),
('Permit', 'Trachinotus falcatus', 'fish-images/permit.jpg', 5, 25.0, 'One of the most challenging flats fish to catch.'),
('Sheepshead', 'Archosargus probatocephalus', 'fish-images/sheepshead.jpg', 2, 4.0, 'Known for human-like teeth and excellent taste.'),
('Black Drum', 'Pogonias cromis', 'fish-images/black-drum.jpg', 2, 30.0, 'Large bottom feeder related to redfish.'),
('Pompano', 'Trachinotus carolinus', 'fish-images/pompano.jpg', 3, 3.0, 'Highly prized for exceptional flavor.'),
('Tripletail', 'Lobotes surinamensis', 'fish-images/tripletail.jpg', 4, 8.0, 'Often found floating near structure.'),
('Cobia', 'Rachycentron canadum', 'fish-images/cobia.jpg', 3, 30.0, 'Strong fighter often found near rays and sharks.'),
('Jack Crevalle', 'Caranx hippos', 'fish-images/jack-crevalle.jpg', 2, 15.0, 'Powerful fighters that hunt in schools.'),

-- Saltwater - Offshore
('Red Snapper', 'Lutjanus campechanus', 'fish-images/red-snapper.jpg', 3, 10.0, 'Popular reef fish with excellent table quality.'),
('Grouper', 'Epinephelus morio', 'fish-images/grouper.jpg', 3, 15.0, 'Ambush predators that live around structure.'),
('Mahi-Mahi', 'Coryphaena hippurus', 'fish-images/mahi-mahi.jpg', 3, 15.0, 'Colorful offshore fish also called Dolphinfish.'),
('Wahoo', 'Acanthocybium solandri', 'fish-images/wahoo.jpg', 4, 40.0, 'One of the fastest fish in the ocean.'),
('King Mackerel', 'Scomberomorus cavalla', 'fish-images/king-mackerel.jpg', 2, 20.0, 'Fast predators popular with offshore anglers.'),
('Spanish Mackerel', 'Scomberomorus maculatus', 'fish-images/spanish-mackerel.jpg', 1, 3.0, 'Smaller mackerel found close to shore.'),
('Blackfin Tuna', 'Thunnus atlanticus', 'fish-images/blackfin-tuna.jpg', 3, 25.0, 'Smallest tuna but great fighters.'),
('Yellowfin Tuna', 'Thunnus albacares', 'fish-images/yellowfin-tuna.jpg', 4, 100.0, 'Powerful offshore gamefish prized for sashimi.'),
('Bluefin Tuna', 'Thunnus thynnus', 'fish-images/bluefin-tuna.jpg', 5, 400.0, 'The ultimate big game fish.'),
('Blue Marlin', 'Makaira nigricans', 'fish-images/blue-marlin.jpg', 5, 400.0, 'The king of billfish, a bucket-list catch.'),
('White Marlin', 'Kajikia albida', 'fish-images/white-marlin.jpg', 5, 60.0, 'Smaller but acrobatic billfish.'),
('Sailfish', 'Istiophorus platypterus', 'fish-images/sailfish.jpg', 4, 50.0, 'The fastest fish in the ocean with spectacular sail.'),
('Swordfish', 'Xiphias gladius', 'fish-images/swordfish.jpg', 5, 200.0, 'Deep-dwelling billfish caught at night.'),
('Amberjack', 'Seriola dumerili', 'fish-images/amberjack.jpg', 3, 40.0, 'Powerful reef donkeys that test tackle.'),

-- Sharks
('Blacktip Shark', 'Carcharhinus limbatus', 'fish-images/blacktip-shark.jpg', 2, 40.0, 'Common inshore shark known for aerial displays.'),
('Bull Shark', 'Carcharhinus leucas', 'fish-images/bull-shark.jpg', 3, 200.0, 'Aggressive shark found in fresh and saltwater.'),
('Hammerhead Shark', 'Sphyrna mokarran', 'fish-images/hammerhead-shark.jpg', 4, 500.0, 'Distinctive shark with hammer-shaped head.'),
('Mako Shark', 'Isurus oxyrinchus', 'fish-images/mako-shark.jpg', 4, 300.0, 'The fastest shark, known for jumping.'),
('Thresher Shark', 'Alopias vulpinus', 'fish-images/thresher-shark.jpg', 4, 350.0, 'Known for their extremely long tail fin.'),

-- Additional Freshwater
('Tiger Trout', 'Salmo trutta x Salvelinus fontinalis', 'fish-images/tiger-trout.jpg', 4, 2.0, 'A striking sterile hybrid with tiger-like markings.'),
('Splake', 'Salvelinus fontinalis x namaycush', 'fish-images/splake.jpg', 4, 4.0, 'Brook and lake trout hybrid.'),
('Hybrid Striped Bass', 'Morone chrysops x saxatilis', 'fish-images/hybrid-striped-bass.jpg', 2, 5.0, 'Popular stocked hybrid, also called wiper.'),
('Kokanee Salmon', 'Oncorhynchus nerka', 'fish-images/kokanee-salmon.jpg', 3, 2.0, 'Landlocked sockeye salmon.'),
('Grayling', 'Thymallus arcticus', 'fish-images/grayling.jpg', 4, 2.0, 'Beautiful fish with sail-like dorsal fin.'),
('Whitefish', 'Coregonus clupeaformis', 'fish-images/whitefish.jpg', 2, 3.0, 'Cold-water fish popular for ice fishing.'),
('Cisco', 'Coregonus artedi', 'fish-images/cisco.jpg', 3, 1.0, 'Also known as lake herring.'),
('Shad', 'Alosa sapidissima', 'fish-images/shad.jpg', 2, 4.0, 'Anadromous fish with excellent fighting ability.'),
('Sturgeon', 'Acipenser transmontanus', 'fish-images/sturgeon.jpg', 5, 200.0, 'Ancient fish that can live over 100 years.'),
('Paddlefish', 'Polyodon spathula', 'fish-images/paddlefish.jpg', 5, 60.0, 'Prehistoric filter feeder with distinctive snout.')

ON CONFLICT (common_name) DO UPDATE SET
  scientific_name = EXCLUDED.scientific_name,
  image_url = EXCLUDED.image_url,
  rarity = EXCLUDED.rarity,
  average_weight = EXCLUDED.average_weight,
  description = EXCLUDED.description;

-- Create unique index on common_name for upsert
CREATE UNIQUE INDEX IF NOT EXISTS idx_fish_species_common_name ON public.fish_species(common_name);

-- Create index for searching
CREATE INDEX IF NOT EXISTS idx_fish_species_search ON public.fish_species USING gin(to_tsvector('english', common_name || ' ' || COALESCE(scientific_name, '')));
