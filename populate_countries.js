import { supabase } from './lib/supabase.js'
import { v4 as uuidv4 } from 'uuid'

// Mapping from 3-letter to 2-letter ISO country codes
const iso3to2 = {
  'AFG': 'AF', 'ALB': 'AL', 'DZA': 'DZ', 'AND': 'AD', 'AGO': 'AO', 'ARG': 'AR', 'ARM': 'AM', 'AUS': 'AU',
  'AUT': 'AT', 'AZE': 'AZ', 'BHS': 'BS', 'BHR': 'BH', 'BGD': 'BD', 'BRB': 'BB', 'BLR': 'BY', 'BEL': 'BE',
  'BLZ': 'BZ', 'BEN': 'BJ', 'BTN': 'BT', 'BOL': 'BO', 'BIH': 'BA', 'BWA': 'BW', 'BRA': 'BR', 'BRN': 'BN',
  'BGR': 'BG', 'BFA': 'BF', 'BDI': 'BI', 'KHM': 'KH', 'CMR': 'CM', 'CAN': 'CA', 'CPV': 'CV', 'CAF': 'CF',
  'TCD': 'TD', 'CHL': 'CL', 'CHN': 'CN', 'COL': 'CO', 'COM': 'KM', 'COD': 'CD', 'COG': 'CG', 'CRI': 'CR',
  'HRV': 'HR', 'CUB': 'CU', 'CYP': 'CY', 'CZE': 'CZ', 'DNK': 'DK', 'DJI': 'DJ', 'DMA': 'DM', 'DOM': 'DO',
  'ECU': 'EC', 'EGY': 'EG', 'SLV': 'SV', 'GNQ': 'GQ', 'ERI': 'ER', 'EST': 'EE', 'SWZ': 'SZ', 'ETH': 'ET',
  'FJI': 'FJ', 'FIN': 'FI', 'FRA': 'FR', 'GAB': 'GA', 'GMB': 'GM', 'GEO': 'GE', 'DEU': 'DE', 'GHA': 'GH',
  'GRC': 'GR', 'GRD': 'GD', 'GTM': 'GT', 'GIN': 'GN', 'GNB': 'GW', 'GUY': 'GY', 'HTI': 'HT', 'HND': 'HN',
  'HUN': 'HU', 'ISL': 'IS', 'IND': 'IN', 'IDN': 'ID', 'IRN': 'IR', 'IRQ': 'IQ', 'IRL': 'IE', 'ISR': 'IL',
  'ITA': 'IT', 'JAM': 'JM', 'JPN': 'JP', 'JOR': 'JO', 'KAZ': 'KZ', 'KEN': 'KE', 'KIR': 'KI', 'KWT': 'KW',
  'KGZ': 'KG', 'LAO': 'LA', 'LVA': 'LV', 'LBN': 'LB', 'LSO': 'LS', 'LBR': 'LR', 'LBY': 'LY', 'LIE': 'LI',
  'LTU': 'LT', 'LUX': 'LU', 'MDG': 'MG', 'MWI': 'MW', 'MYS': 'MY', 'MDV': 'MV', 'MLI': 'ML', 'MLT': 'MT',
  'MHL': 'MH', 'MRT': 'MR', 'MUS': 'MU', 'MEX': 'MX', 'FSM': 'FM', 'MDA': 'MD', 'MCO': 'MC', 'MNG': 'MN',
  'MNE': 'ME', 'MAR': 'MA', 'MOZ': 'MZ', 'MMR': 'MM', 'NAM': 'NA', 'NRU': 'NR', 'NPL': 'NP', 'NLD': 'NL',
  'NZL': 'NZ', 'NIC': 'NI', 'NER': 'NE', 'NGA': 'NG', 'PRK': 'KP', 'MKD': 'MK', 'NOR': 'NO', 'OMN': 'OM',
  'PAK': 'PK', 'PLW': 'PW', 'PAN': 'PA', 'PNG': 'PG', 'PRY': 'PY', 'PER': 'PE', 'PHL': 'PH', 'POL': 'PL',
  'PRT': 'PT', 'QAT': 'QA', 'ROU': 'RO', 'RUS': 'RU', 'RWA': 'RW', 'KNA': 'KN', 'LCA': 'LC', 'VCT': 'VC',
  'WSM': 'WS', 'SMR': 'SM', 'STP': 'ST', 'SAU': 'SA', 'SEN': 'SN', 'SRB': 'RS', 'SYC': 'SC', 'SLE': 'SL',
  'SGP': 'SG', 'SVK': 'SK', 'SVN': 'SI', 'SLB': 'SB', 'SOM': 'SO', 'ZAF': 'ZA', 'KOR': 'KR', 'SSD': 'SS',
  'ESP': 'ES', 'LKA': 'LK', 'SDN': 'SD', 'SUR': 'SR', 'SWE': 'SE', 'CHE': 'CH', 'SYR': 'SY', 'TWN': 'TW',
  'TJK': 'TJ', 'TZA': 'TZ', 'THA': 'TH', 'TLS': 'TL', 'TGO': 'TG', 'TON': 'TO', 'TTO': 'TT', 'TUN': 'TN',
  'TUR': 'TR', 'TKM': 'TM', 'TUV': 'TV', 'UGA': 'UG', 'UKR': 'UA', 'ARE': 'AE', 'GBR': 'GB', 'USA': 'US',
  'URY': 'UY', 'UZB': 'UZ', 'VUT': 'VU', 'VAT': 'VA', 'VEN': 'VE', 'VNM': 'VN', 'YEM': 'YE', 'ZMB': 'ZM',
  'ZWE': 'ZW', 'PSE': 'PS'
}

// Countries data from the uploaded CSV
const countriesData = [
  { country_name: "Afghanistan", country_code: "AFG", main_cuisine: "Afghan", cuisine_description: "Afghan cuisine features rice dishes, grilled meats, and flatbreads. Known for kabuli pulao, mantu dumplings, and the use of aromatic spices like cardamom and saffron." },
  { country_name: "Albania", country_code: "ALB", main_cuisine: "Albanian", cuisine_description: "Albanian cuisine combines Mediterranean and Balkan influences with fresh vegetables, olive oil, and grilled meats. Famous for byrek pastry and fërgesë casserole." },
  { country_name: "Algeria", country_code: "DZA", main_cuisine: "Algerian", cuisine_description: "Algerian cuisine blends Berber, Arab, and French influences featuring couscous, tagines, and mint tea. Known for chorba soup and makroudh pastries." },
  { country_name: "Andorra", country_code: "AND", main_cuisine: "Andorran", cuisine_description: "Andorran cuisine reflects Catalan and French influences with mountain fare including grilled meats, hearty stews, and local cheeses." },
  { country_name: "Angola", country_code: "AGO", main_cuisine: "Angolan", cuisine_description: "Angolan cuisine features Portuguese influences with cassava, plantains, and fresh seafood. Known for muamba de galinha and funge cornmeal." },
  { country_name: "Argentina", country_code: "ARG", main_cuisine: "Argentinian", cuisine_description: "Argentinian cuisine is famous for beef, especially asado barbecue, empanadas, and mate tea. Italian influences are strong with pasta and pizza." },
  { country_name: "Armenia", country_code: "ARM", main_cuisine: "Armenian", cuisine_description: "Armenian cuisine features grilled meats, flatbreads, and fresh herbs. Known for dolma, lavash bread, and khachapuri cheese pastry." },
  { country_name: "Australia", country_code: "AUS", main_cuisine: "Australian", cuisine_description: "Australian cuisine combines British roots with Asian influences, featuring fresh seafood, meat pies, and bush tucker ingredients like wattleseed." },
  { country_name: "Austria", country_code: "AUT", main_cuisine: "Austrian", cuisine_description: "Austrian cuisine is known for hearty dishes like schnitzel, strudel, and sachertorte. Alpine influences bring dumplings and sausages." },
  { country_name: "Azerbaijan", country_code: "AZE", main_cuisine: "Azerbaijani", cuisine_description: "Azerbaijani cuisine features rice dishes, grilled meats, and fresh herbs. Known for plov, dolma, and kebabs with pomegranate and saffron." },
  { country_name: "Bahamas", country_code: "BHS", main_cuisine: "Bahamian", cuisine_description: "Bahamian cuisine centers on fresh seafood, conch, and tropical fruits. Known for conch fritters, johnny cake, and rum cake." },
  { country_name: "Bahrain", country_code: "BHR", main_cuisine: "Bahraini", cuisine_description: "Bahraini cuisine features Middle Eastern flavors with rice dishes, grilled meats, and dates. Known for machboos and muhammar rice." },
  { country_name: "Bangladesh", country_code: "BGD", main_cuisine: "Bangladeshi", cuisine_description: "Bangladeshi cuisine features rice, fish, and spicy curries. Known for hilsa fish, biryani, and sweets like rasgulla and sandesh." },
  { country_name: "Barbados", country_code: "BRB", main_cuisine: "Barbadian", cuisine_description: "Barbadian cuisine features Caribbean flavors with flying fish, cou-cou, and rum. Known for fish cakes and pepper pot stew." },
  { country_name: "Belarus", country_code: "BLR", main_cuisine: "Belarusian", cuisine_description: "Belarusian cuisine features hearty dishes with potatoes, meat, and dairy. Known for draniki potato pancakes and borscht soup." },
  { country_name: "Belgium", country_code: "BEL", main_cuisine: "Belgian", cuisine_description: "Belgian cuisine is famous for chocolate, waffles, and beer. Also known for moules-frites and carbonade flamande beef stew." },
  { country_name: "Belize", country_code: "BLZ", main_cuisine: "Belizean", cuisine_description: "Belizean cuisine combines Caribbean, Mexican, and British influences with rice and beans, fresh seafood, and tropical fruits." },
  { country_name: "Benin", country_code: "BEN", main_cuisine: "Beninese", cuisine_description: "Beninese cuisine features corn, yams, and spicy stews. Known for akassa corn porridge and grilled fish with palm oil." },
  { country_name: "Bhutan", country_code: "BTN", main_cuisine: "Bhutanese", cuisine_description: "Bhutanese cuisine features chili peppers, yak meat, and red rice. Known for ema datshi (chili cheese) and momo dumplings." },
  { country_name: "Bolivia", country_code: "BOL", main_cuisine: "Bolivian", cuisine_description: "Bolivian cuisine features quinoa, potatoes, and llama meat. Known for salteñas pastries and anticuchos grilled beef heart." },
  { country_name: "Bosnia and Herzegovina", country_code: "BIH", main_cuisine: "Bosnian", cuisine_description: "Bosnian cuisine combines Ottoman and European influences with grilled meats, pastries, and strong coffee. Known for ćevapi and burek." },
  { country_name: "Botswana", country_code: "BWA", main_cuisine: "Batswana", cuisine_description: "Batswana cuisine features sorghum, beef, and wild game. Known for seswaa shredded meat and morogo wild spinach." },
  { country_name: "Brazil", country_code: "BRA", main_cuisine: "Brazilian", cuisine_description: "Brazilian cuisine is diverse with regional specialties like feijoada black bean stew, churrasco barbecue, and açaí bowls." },
  { country_name: "Brunei", country_code: "BRN", main_cuisine: "Bruneian", cuisine_description: "Bruneian cuisine combines Malay and Chinese influences with rice, seafood, and tropical fruits. Known for ambuyat sago starch." },
  { country_name: "Bulgaria", country_code: "BGR", main_cuisine: "Bulgarian", cuisine_description: "Bulgarian cuisine features yogurt, cheese, and grilled meats. Known for shopska salad, banitsa pastry, and rakia brandy." },
  { country_name: "Burkina Faso", country_code: "BFA", main_cuisine: "Burkinabé", cuisine_description: "Burkinabé cuisine features millet, sorghum, and vegetables. Known for riz sauce and grilled meat with spicy sauces." },
  { country_name: "Burundi", country_code: "BDI", main_cuisine: "Burundian", cuisine_description: "Burundian cuisine features beans, bananas, and cassava. Known for ubugali cornmeal and grilled tilapia fish." },
  { country_name: "Cambodia", country_code: "KHM", main_cuisine: "Cambodian", cuisine_description: "Cambodian cuisine features rice, fish, and fresh herbs. Known for amok fish curry, pho soup, and tropical fruit desserts." },
  { country_name: "Cameroon", country_code: "CMR", main_cuisine: "Cameroonian", cuisine_description: "Cameroonian cuisine features plantains, cassava, and spicy stews. Known for ndolé bitterleaf soup and grilled fish." },
  { country_name: "Canada", country_code: "CAN", main_cuisine: "Canadian", cuisine_description: "Canadian cuisine features maple syrup, seafood, and multicultural influences. Known for poutine, tourtière, and butter tarts." },
  { country_name: "Cape Verde", country_code: "CPV", main_cuisine: "Cape Verdean", cuisine_description: "Cape Verdean cuisine features Portuguese influences with fresh seafood, corn, and beans. Known for cachupa stew and grogue rum." },
  { country_name: "Central African Republic", country_code: "CAF", main_cuisine: "Central African", cuisine_description: "Central African cuisine features cassava, plantains, and bush meat. Known for saka saka cassava leaves and grilled antelope." },
  { country_name: "Chad", country_code: "TCD", main_cuisine: "Chadian", cuisine_description: "Chadian cuisine features millet, sorghum, and dried meat. Known for boule grain porridge and daraba okra stew." },
  { country_name: "Chile", country_code: "CHL", main_cuisine: "Chilean", cuisine_description: "Chilean cuisine features seafood, wine, and empanadas. Known for ceviche, cazuela stew, and pisco brandy." },
  { country_name: "China", country_code: "CHN", main_cuisine: "Chinese", cuisine_description: "Chinese cuisine is incredibly diverse with regional styles featuring rice, noodles, and stir-fries. Known for dim sum, Peking duck, and hot pot." },
  { country_name: "Colombia", country_code: "COL", main_cuisine: "Colombian", cuisine_description: "Colombian cuisine features rice, beans, and tropical fruits. Known for arepas, bandeja paisa, and fresh fruit juices." },
  { country_name: "Comoros", country_code: "COM", main_cuisine: "Comorian", cuisine_description: "Comorian cuisine combines African, Arab, and French influences with rice, seafood, and spices like vanilla and ylang-ylang." },
  { country_name: "Congo (Democratic Republic)", country_code: "COD", main_cuisine: "Congolese", cuisine_description: "Congolese cuisine features cassava, plantains, and river fish. Known for fufu starch and moambe palm nut stew." },
  { country_name: "Congo (Republic)", country_code: "COG", main_cuisine: "Congolese", cuisine_description: "Congolese cuisine features cassava, yams, and grilled meats. Known for saka saka and pondu cassava leaf dishes." },
  { country_name: "Costa Rica", country_code: "CRI", main_cuisine: "Costa Rican", cuisine_description: "Costa Rican cuisine features rice, beans, and tropical fruits. Known for gallo pinto, casado plates, and café." },
  { country_name: "Croatia", country_code: "HRV", main_cuisine: "Croatian", cuisine_description: "Croatian cuisine combines Mediterranean and Central European influences with seafood, truffles, and wine. Known for peka roasted dishes." },
  { country_name: "Cuba", country_code: "CUB", main_cuisine: "Cuban", cuisine_description: "Cuban cuisine features rice, beans, and pork. Known for ropa vieja, cubano sandwiches, and mojitos with rum." },
  { country_name: "Cyprus", country_code: "CYP", main_cuisine: "Cypriot", cuisine_description: "Cypriot cuisine combines Greek and Turkish influences with halloumi cheese, grilled meats, and fresh vegetables." },
  { country_name: "Czech Republic", country_code: "CZE", main_cuisine: "Czech", cuisine_description: "Czech cuisine features hearty dishes with pork, dumplings, and beer. Known for goulash, schnitzel, and kolaches." },
  { country_name: "Denmark", country_code: "DNK", main_cuisine: "Danish", cuisine_description: "Danish cuisine features seafood, pork, and rye bread. Known for smørrebrød open sandwiches and Danish pastries." },
  { country_name: "Djibouti", country_code: "DJI", main_cuisine: "Djiboutian", cuisine_description: "Djiboutian cuisine combines Somali, Ethiopian, and French influences with spiced rice, flatbreads, and goat meat." },
  { country_name: "Dominica", country_code: "DMA", main_cuisine: "Dominican", cuisine_description: "Dominican cuisine features Caribbean flavors with plantains, rice, and fresh seafood. Known for callaloo soup and rum." },
  { country_name: "Dominican Republic", country_code: "DOM", main_cuisine: "Dominican", cuisine_description: "Dominican cuisine features rice, beans, and tropical fruits. Known for mangu mashed plantains and merengue cocktails." },
  { country_name: "Ecuador", country_code: "ECU", main_cuisine: "Ecuadorian", cuisine_description: "Ecuadorian cuisine features quinoa, potatoes, and fresh seafood. Known for ceviche, llapingachos, and cuy guinea pig." },
  { country_name: "Egypt", country_code: "EGY", main_cuisine: "Egyptian", cuisine_description: "Egyptian cuisine features rice, beans, and flatbreads. Known for koshari mixed rice, ful medames, and baklava." },
  { country_name: "El Salvador", country_code: "SLV", main_cuisine: "Salvadoran", cuisine_description: "Salvadoran cuisine features corn, beans, and cheese. Known for pupusas stuffed tortillas and horchata drink." },
  { country_name: "Equatorial Guinea", country_code: "GNQ", main_cuisine: "Equatorial Guinean", cuisine_description: "Equatorial Guinean cuisine features cassava, plantains, and seafood. Known for succotash and palm wine." },
  { country_name: "Eritrea", country_code: "ERI", main_cuisine: "Eritrean", cuisine_description: "Eritrean cuisine features injera flatbread, lentils, and spiced meats. Known for zigni stew and berbere spice blend." },
  { country_name: "Estonia", country_code: "EST", main_cuisine: "Estonian", cuisine_description: "Estonian cuisine features rye bread, pork, and dairy products. Known for black bread, blood sausage, and kama grain mixture." },
  { country_name: "Eswatini", country_code: "SWZ", main_cuisine: "Swazi", cuisine_description: "Swazi cuisine features corn, beef, and wild vegetables. Known for sishwala porridge and umngqusho corn and beans." },
  { country_name: "Ethiopia", country_code: "ETH", main_cuisine: "Ethiopian", cuisine_description: "Ethiopian cuisine features injera bread, berbere spices, and coffee ceremonies. Known for doro wat chicken stew and kitfo raw beef." },
  { country_name: "Fiji", country_code: "FJI", main_cuisine: "Fijian", cuisine_description: "Fijian cuisine combines Pacific island and Indian influences with coconut, taro, and fresh fish. Known for kokoda ceviche." },
  { country_name: "Finland", country_code: "FIN", main_cuisine: "Finnish", cuisine_description: "Finnish cuisine features fish, game, and berries. Known for karelian pies, reindeer, and cloudberry desserts." },
  { country_name: "France", country_code: "FRA", main_cuisine: "French", cuisine_description: "French cuisine is renowned for its sophisticated techniques, rich sauces, and fine cheeses. From buttery croissants to coq au vin, it's the foundation of modern culinary arts." },
  { country_name: "Gabon", country_code: "GAB", main_cuisine: "Gabonese", cuisine_description: "Gabonese cuisine features cassava, plantains, and bushmeat. Known for nyama grilled meat and palm wine." },
  { country_name: "Gambia", country_code: "GMB", main_cuisine: "Gambian", cuisine_description: "Gambian cuisine features rice, fish, and peanuts. Known for benachin jollof rice and domoda peanut stew." },
  { country_name: "Georgia", country_code: "GEO", main_cuisine: "Georgian", cuisine_description: "Georgian cuisine features khachapuri cheese bread, khinkali dumplings, and wine. Known for supra feast traditions." },
  { country_name: "Germany", country_code: "DEU", main_cuisine: "German", cuisine_description: "German cuisine features sausages, beer, and hearty dishes. Known for bratwurst, sauerkraut, and pretzels." },
  { country_name: "Ghana", country_code: "GHA", main_cuisine: "Ghanaian", cuisine_description: "Ghanaian cuisine features yams, cassava, and spicy stews. Known for jollof rice, banku, and kelewele spiced plantains." },
  { country_name: "Greece", country_code: "GRC", main_cuisine: "Greek", cuisine_description: "Greek cuisine features olive oil, feta cheese, and Mediterranean ingredients. Known for moussaka, souvlaki, and baklava." },
  { country_name: "Grenada", country_code: "GRD", main_cuisine: "Grenadian", cuisine_description: "Grenadian cuisine features spices, seafood, and tropical fruits. Known as the 'Spice Island' for nutmeg and cinnamon." },
  { country_name: "Guatemala", country_code: "GTM", main_cuisine: "Guatemalan", cuisine_description: "Guatemalan cuisine features corn, beans, and chili peppers. Known for pepián spicy stew and tamales." },
  { country_name: "Guinea", country_code: "GIN", main_cuisine: "Guinean", cuisine_description: "Guinean cuisine features rice, cassava, and palm oil. Known for jollof rice and plasas spinach stew." },
  { country_name: "Guinea-Bissau", country_code: "GNB", main_cuisine: "Guinea-Bissauan", cuisine_description: "Guinea-Bissauan cuisine features rice, fish, and cashews. Known for canja rice porridge and grilled fish." },
  { country_name: "Guyana", country_code: "GUY", main_cuisine: "Guyanese", cuisine_description: "Guyanese cuisine combines Caribbean, Indian, and Chinese influences with curry, roti, and fresh seafood." },
  { country_name: "Haiti", country_code: "HTI", main_cuisine: "Haitian", cuisine_description: "Haitian cuisine features rice, beans, and Creole spices. Known for griot fried pork and bannann boukannen." },
  { country_name: "Honduras", country_code: "HND", main_cuisine: "Honduran", cuisine_description: "Honduran cuisine features corn, beans, and tropical fruits. Known for baleadas tortillas and sopa de caracol conch soup." },
  { country_name: "Hungary", country_code: "HUN", main_cuisine: "Hungarian", cuisine_description: "Hungarian cuisine features paprika, goulash, and hearty stews. Known for chimney cake and palinka brandy." },
  { country_name: "Iceland", country_code: "ISL", main_cuisine: "Icelandic", cuisine_description: "Icelandic cuisine features fresh fish, lamb, and dairy. Known for hákarl fermented shark and skyr yogurt." },
  { country_name: "India", country_code: "IND", main_cuisine: "Indian", cuisine_description: "Indian cuisine features complex spice blends, diverse regional styles, and both vegetarian and meat dishes. Known for curry, biryani, tandoor cooking, and bread varieties like naan." },
  { country_name: "Indonesia", country_code: "IDN", main_cuisine: "Indonesian", cuisine_description: "Indonesian cuisine features rice, spices, and coconut. Known for nasi goreng fried rice, satay, and rendang beef curry." },
  { country_name: "Iran", country_code: "IRN", main_cuisine: "Persian", cuisine_description: "Persian cuisine features rice, saffron, and grilled meats. Known for kebabs, tahdig crispy rice, and rosewater sweets." },
  { country_name: "Iraq", country_code: "IRQ", main_cuisine: "Iraqi", cuisine_description: "Iraqi cuisine features rice, lamb, and dates. Known for masgouf grilled fish, dolma, and klecha pastries." },
  { country_name: "Ireland", country_code: "IRL", main_cuisine: "Irish", cuisine_description: "Irish cuisine features potatoes, lamb, and dairy. Known for Irish stew, colcannon, and soda bread." },
  { country_name: "Palestine", country_code: "PSE", main_cuisine: "Palestinian", cuisine_description: "Palestinian cuisine features olive oil, fresh herbs, and Mediterranean ingredients. Known for musakhan chicken, maqluba upside-down rice, and knafeh dessert." },
  { country_name: "Italy", country_code: "ITA", main_cuisine: "Italian", cuisine_description: "Italian cuisine is known for its regional diversity, featuring pasta, pizza, risotto, and fresh ingredients like tomatoes, olive oil, and basil. From creamy Northern dishes to spicy Southern flavors." },
  { country_name: "Jamaica", country_code: "JAM", main_cuisine: "Jamaican", cuisine_description: "Jamaican cuisine features jerk spices, rum, and tropical fruits. Known for jerk chicken, ackee and saltfish, and patties." },
  { country_name: "Japan", country_code: "JPN", main_cuisine: "Japanese", cuisine_description: "Japanese cuisine emphasizes seasonal ingredients, umami flavors, and beautiful presentation. Famous for sushi, ramen, tempura, and traditional dishes like kaiseki." },
  { country_name: "Jordan", country_code: "JOR", main_cuisine: "Jordanian", cuisine_description: "Jordanian cuisine features rice, lamb, and yogurt. Known for mansaf national dish, falafel, and ma'amoul cookies." },
  { country_name: "Kazakhstan", country_code: "KAZ", main_cuisine: "Kazakhstani", cuisine_description: "Kazakhstani cuisine features horse meat, dairy, and wheat. Known for beshbarmak noodle dish and kumys fermented mare's milk." },
  { country_name: "Kenya", country_code: "KEN", main_cuisine: "Kenyan", cuisine_description: "Kenyan cuisine features corn, beans, and grilled meats. Known for ugali cornmeal, nyama choma barbecue, and chai tea." },
  { country_name: "Kiribati", country_code: "KIR", main_cuisine: "I-Kiribati", cuisine_description: "I-Kiribati cuisine features coconut, fish, and taro. Known for te bua taro root and coconut crab." },
  { country_name: "Kuwait", country_code: "KWT", main_cuisine: "Kuwaiti", cuisine_description: "Kuwaiti cuisine features rice, seafood, and dates. Known for machboos spiced rice and luqaimat sweet dumplings." },
  { country_name: "Kyrgyzstan", country_code: "KGZ", main_cuisine: "Kyrgyz", cuisine_description: "Kyrgyz cuisine features mutton, dairy, and bread. Known for beshbarmak, manti dumplings, and kumys fermented milk." },
  { country_name: "Laos", country_code: "LAO", main_cuisine: "Lao", cuisine_description: "Lao cuisine features sticky rice, fish sauce, and fresh herbs. Known for larb meat salad and tam mak hoong papaya salad." },
  { country_name: "Latvia", country_code: "LVA", main_cuisine: "Latvian", cuisine_description: "Latvian cuisine features rye bread, pork, and root vegetables. Known for piragi bacon rolls and rupjmaize dark bread." },
  { country_name: "Lebanon", country_code: "LBN", main_cuisine: "Lebanese", cuisine_description: "Lebanese cuisine features mezze, olive oil, and fresh herbs. Known for hummus, tabbouleh, and baklava." },
  { country_name: "Lesotho", country_code: "LSO", main_cuisine: "Basotho", cuisine_description: "Basotho cuisine features corn, sorghum, and mutton. Known for papa cornmeal porridge and moroko mopane worms." },
  { country_name: "Liberia", country_code: "LBR", main_cuisine: "Liberian", cuisine_description: "Liberian cuisine features rice, cassava, and palm oil. Known for jollof rice and pepper soup." },
  { country_name: "Libya", country_code: "LBY", main_cuisine: "Libyan", cuisine_description: "Libyan cuisine features couscous, lamb, and dates. Known for bazin barley dish and shorba soup." },
  { country_name: "Liechtenstein", country_code: "LIE", main_cuisine: "Liechtensteiner", cuisine_description: "Liechtensteiner cuisine reflects German and Austrian influences with hearty mountain fare and local wines." },
  { country_name: "Lithuania", country_code: "LTU", main_cuisine: "Lithuanian", cuisine_description: "Lithuanian cuisine features potatoes, rye, and dairy. Known for cepelinai potato dumplings and dark rye bread." },
  { country_name: "Luxembourg", country_code: "LUX", main_cuisine: "Luxembourgish", cuisine_description: "Luxembourgish cuisine combines French and German influences with hearty dishes and local wines." },
  { country_name: "Madagascar", country_code: "MDG", main_cuisine: "Malagasy", cuisine_description: "Malagasy cuisine features rice, zebu beef, and tropical fruits. Known for romazava leafy green stew and vary rice dishes." },
  { country_name: "Malawi", country_code: "MWI", main_cuisine: "Malawian", cuisine_description: "Malawian cuisine features corn, fish, and vegetables. Known for nsima cornmeal staple and chambo fish." },
  { country_name: "Malaysia", country_code: "MYS", main_cuisine: "Malaysian", cuisine_description: "Malaysian cuisine combines Malay, Chinese, and Indian influences with coconut, spices, and noodles. Known for nasi lemak and laksa." },
  { country_name: "Maldives", country_code: "MDV", main_cuisine: "Maldivian", cuisine_description: "Maldivian cuisine features fish, coconut, and rice. Known for garudhiya fish soup and mas huni tuna salad." },
  { country_name: "Mali", country_code: "MLI", main_cuisine: "Malian", cuisine_description: "Malian cuisine features millet, rice, and peanuts. Known for jollof rice and tigadegena peanut stew." },
  { country_name: "Malta", country_code: "MLT", main_cuisine: "Maltese", cuisine_description: "Maltese cuisine combines Mediterranean influences with rabbit, seafood, and bread. Known for fenkata rabbit stew." },
  { country_name: "Marshall Islands", country_code: "MHL", main_cuisine: "Marshallese", cuisine_description: "Marshallese cuisine features coconut, fish, and breadfruit. Known for coconut crab and pandanus fruit." },
  { country_name: "Mauritania", country_code: "MRT", main_cuisine: "Mauritanian", cuisine_description: "Mauritanian cuisine features dates, camel meat, and couscous. Known for thieboudienne fish and rice." },
  { country_name: "Mauritius", country_code: "MUS", main_cuisine: "Mauritian", cuisine_description: "Mauritian cuisine combines French, Indian, and Chinese influences with curry, seafood, and tropical fruits." },
  { country_name: "Mexico", country_code: "MEX", main_cuisine: "Mexican", cuisine_description: "Mexican cuisine combines indigenous and Spanish influences, featuring corn, beans, chilies, and chocolate. Famous for tacos, mole, pozole, and fresh salsas." },
  { country_name: "Micronesia", country_code: "FSM", main_cuisine: "Micronesian", cuisine_description: "Micronesian cuisine features fish, taro, and coconut. Known for coconut crab and breadfruit dishes." },
  { country_name: "Moldova", country_code: "MDA", main_cuisine: "Moldovan", cuisine_description: "Moldovan cuisine features wine, corn, and dairy. Known for mămăligă cornmeal and plăcintă pastries." },
  { country_name: "Monaco", country_code: "MCO", main_cuisine: "Monégasque", cuisine_description: "Monégasque cuisine reflects French and Italian influences with Mediterranean seafood and luxury ingredients." },
  { country_name: "Mongolia", country_code: "MNG", main_cuisine: "Mongolian", cuisine_description: "Mongolian cuisine features mutton, dairy, and bread. Known for buuz steamed dumplings and airag fermented mare's milk." },
  { country_name: "Montenegro", country_code: "MNE", main_cuisine: "Montenegrin", cuisine_description: "Montenegrin cuisine combines Balkan and Mediterranean influences with grilled meats, cheese, and wine." },
  { country_name: "Morocco", country_code: "MAR", main_cuisine: "Moroccan", cuisine_description: "Moroccan cuisine features tagines, couscous, and mint tea. Known for preserved lemons, argan oil, and pastilla." },
  { country_name: "Mozambique", country_code: "MOZ", main_cuisine: "Mozambican", cuisine_description: "Mozambican cuisine features Portuguese influences with seafood, coconut, and peri-peri peppers." },
  { country_name: "Myanmar", country_code: "MMR", main_cuisine: "Burmese", cuisine_description: "Burmese cuisine features rice, fish sauce, and curry. Known for mohinga fish noodle soup and tea leaf salad." },
  { country_name: "Namibia", country_code: "NAM", main_cuisine: "Namibian", cuisine_description: "Namibian cuisine features game meat, maize, and German influences. Known for biltong dried meat and potjiekos stew." },
  { country_name: "Nauru", country_code: "NRU", main_cuisine: "Nauruan", cuisine_description: "Nauruan cuisine features coconut, fish, and imported foods. Known for coconut crab and pandanus fruit." },
  { country_name: "Nepal", country_code: "NPL", main_cuisine: "Nepali", cuisine_description: "Nepali cuisine features rice, lentils, and spices. Known for dal bhat, momo dumplings, and gundruk fermented greens." },
  { country_name: "Netherlands", country_code: "NLD", main_cuisine: "Dutch", cuisine_description: "Dutch cuisine features cheese, herring, and hearty dishes. Known for stroopwafels, bitterballen, and Dutch oven cooking." },
  { country_name: "New Zealand", country_code: "NZL", main_cuisine: "New Zealand", cuisine_description: "New Zealand cuisine features lamb, seafood, and indigenous ingredients. Known for pavlova, hangi earth oven, and sauvignon blanc." },
  { country_name: "Nicaragua", country_code: "NIC", main_cuisine: "Nicaraguan", cuisine_description: "Nicaraguan cuisine features corn, beans, and plantains. Known for gallo pinto, nacatamales, and tres leches cake." },
  { country_name: "Niger", country_code: "NER", main_cuisine: "Nigerien", cuisine_description: "Nigerien cuisine features millet, sorghum, and goat meat. Known for tuwo grain porridge and kilishi dried meat." },
  { country_name: "Nigeria", country_code: "NGA", main_cuisine: "Nigerian", cuisine_description: "Nigerian cuisine features yams, rice, and spicy stews. Known for jollof rice, suya spiced meat, and egusi soup." },
  { country_name: "North Korea", country_code: "PRK", main_cuisine: "North Korean", cuisine_description: "North Korean cuisine features rice, kimchi, and grilled meats. Known for naengmyeon cold noodles and bulgogi." },
  { country_name: "North Macedonia", country_code: "MKD", main_cuisine: "Macedonian", cuisine_description: "Macedonian cuisine combines Balkan influences with grilled meats, cheese, and wine. Known for tavče gravče beans." },
  { country_name: "Norway", country_code: "NOR", main_cuisine: "Norwegian", cuisine_description: "Norwegian cuisine features salmon, reindeer, and preserved foods. Known for lefse flatbread and aquavit spirits." },
  { country_name: "Oman", country_code: "OMN", main_cuisine: "Omani", cuisine_description: "Omani cuisine features rice, dates, and seafood. Known for shuwa slow-cooked meat and halwa sweets." },
  { country_name: "Pakistan", country_code: "PAK", main_cuisine: "Pakistani", cuisine_description: "Pakistani cuisine features rice, wheat, and spicy curries. Known for biryani, karahi, and naan bread." },
  { country_name: "Palau", country_code: "PLW", main_cuisine: "Palauan", cuisine_description: "Palauan cuisine features fish, taro, and coconut. Known for fruit bat soup and coconut crab." },
  { country_name: "Panama", country_code: "PAN", main_cuisine: "Panamanian", cuisine_description: "Panamanian cuisine features rice, beans, and seafood. Known for sancocho stew and patacones fried plantains." },
  { country_name: "Papua New Guinea", country_code: "PNG", main_cuisine: "Papua New Guinean", cuisine_description: "Papua New Guinean cuisine features sago, sweet potatoes, and pork. Known for mumu earth oven cooking." },
  { country_name: "Paraguay", country_code: "PRY", main_cuisine: "Paraguayan", cuisine_description: "Paraguayan cuisine features corn, cassava, and beef. Known for chipa cheese bread and asado barbecue." },
  { country_name: "Peru", country_code: "PER", main_cuisine: "Peruvian", cuisine_description: "Peruvian cuisine features quinoa, potatoes, and ceviche. Known for lomo saltado, anticuchos, and pisco." },
  { country_name: "Philippines", country_code: "PHL", main_cuisine: "Filipino", cuisine_description: "Filipino cuisine features rice, pork, and tropical fruits. Known for adobo, lechon, and halo-halo dessert." },
  { country_name: "Poland", country_code: "POL", main_cuisine: "Polish", cuisine_description: "Polish cuisine features pierogi, sausages, and hearty soups. Known for bigos sauerkraut stew and vodka." },
  { country_name: "Portugal", country_code: "PRT", main_cuisine: "Portuguese", cuisine_description: "Portuguese cuisine features seafood, olive oil, and pastries. Known for bacalhau cod, pastéis de nata, and port wine." },
  { country_name: "Qatar", country_code: "QAT", main_cuisine: "Qatari", cuisine_description: "Qatari cuisine features rice, lamb, and dates. Known for machboos spiced rice and luqaimat sweet dumplings." },
  { country_name: "Romania", country_code: "ROU", main_cuisine: "Romanian", cuisine_description: "Romanian cuisine features corn, pork, and dairy. Known for mici grilled meat rolls and țuică plum brandy." },
  { country_name: "Russia", country_code: "RUS", main_cuisine: "Russian", cuisine_description: "Russian cuisine features beets, cabbage, and vodka. Known for borscht soup, beef stroganoff, and caviar." },
  { country_name: "Rwanda", country_code: "RWA", main_cuisine: "Rwandan", cuisine_description: "Rwandan cuisine features beans, bananas, and sweet potatoes. Known for igikoma mixed vegetables and urwagwa banana beer." },
  { country_name: "Saint Kitts and Nevis", country_code: "KNA", main_cuisine: "Kittitian and Nevisian", cuisine_description: "Kittitian cuisine features seafood, goat, and tropical fruits. Known for goat water stew and sugar cake." },
  { country_name: "Saint Lucia", country_code: "LCA", main_cuisine: "Saint Lucian", cuisine_description: "Saint Lucian cuisine features seafood, plantains, and Creole spices. Known for green fig and saltfish." },
  { country_name: "Saint Vincent and the Grenadines", country_code: "VCT", main_cuisine: "Vincentian", cuisine_description: "Vincentian cuisine features breadfruit, seafood, and arrowroot. Known for roasted breadfruit and callaloo soup." },
  { country_name: "Samoa", country_code: "WSM", main_cuisine: "Samoan", cuisine_description: "Samoan cuisine features coconut, taro, and fish. Known for palusami corned beef in coconut cream and oka raw fish." },
  { country_name: "San Marino", country_code: "SMR", main_cuisine: "Sammarinese", cuisine_description: "Sammarinese cuisine reflects Italian influences with pasta, wine, and local specialties like bustrengo cake." },
  { country_name: "São Tomé and Príncipe", country_code: "STP", main_cuisine: "São Toméan", cuisine_description: "São Toméan cuisine features Portuguese influences with seafood, tropical fruits, and palm wine." },
  { country_name: "Saudi Arabia", country_code: "SAU", main_cuisine: "Saudi Arabian", cuisine_description: "Saudi Arabian cuisine features rice, dates, and lamb. Known for kabsa spiced rice and Arabic coffee." },
  { country_name: "Senegal", country_code: "SEN", main_cuisine: "Senegalese", cuisine_description: "Senegalese cuisine features rice, fish, and peanuts. Known for thieboudienne fish and rice and yassa chicken." },
  { country_name: "Serbia", country_code: "SRB", main_cuisine: "Serbian", cuisine_description: "Serbian cuisine features grilled meats, dairy, and plum brandy. Known for ćevapi, sarma, and kajmak cream." },
  { country_name: "Seychelles", country_code: "SYC", main_cuisine: "Seychellois", cuisine_description: "Seychellois cuisine combines French, Indian, and Creole influences with seafood, coconut, and tropical fruits." },
  { country_name: "Sierra Leone", country_code: "SLE", main_cuisine: "Sierra Leonean", cuisine_description: "Sierra Leonean cuisine features rice, palm oil, and cassava leaves. Known for jollof rice and pepper soup." },
  { country_name: "Singapore", country_code: "SGP", main_cuisine: "Singaporean", cuisine_description: "Singaporean cuisine combines Chinese, Malay, and Indian influences. Known for chicken rice, laksa, and chili crab." },
  { country_name: "Slovakia", country_code: "SVK", main_cuisine: "Slovak", cuisine_description: "Slovak cuisine features dumplings, sausages, and hearty soups. Known for bryndzové halušky potato dumplings." },
  { country_name: "Slovenia", country_code: "SVN", main_cuisine: "Slovenian", cuisine_description: "Slovenian cuisine combines Alpine and Mediterranean influences with potica nut roll and wine." },
  { country_name: "Solomon Islands", country_code: "SLB", main_cuisine: "Solomon Islander", cuisine_description: "Solomon Islander cuisine features fish, taro, and coconut. Known for poi taro pudding and coconut crab." },
  { country_name: "Somalia", country_code: "SOM", main_cuisine: "Somali", cuisine_description: "Somali cuisine features rice, camel meat, and flatbreads. Known for anjero pancakes and sambusa pastries." },
  { country_name: "South Africa", country_code: "ZAF", main_cuisine: "South African", cuisine_description: "South African cuisine features braai barbecue, game meat, and wine. Known for biltong, boerewors, and bobotie." },
  { country_name: "South Korea", country_code: "KOR", main_cuisine: "Korean", cuisine_description: "Korean cuisine features rice, kimchi, and fermented foods. Known for bulgogi, bibimbap, and Korean barbecue." },
  { country_name: "South Sudan", country_code: "SSD", main_cuisine: "South Sudanese", cuisine_description: "South Sudanese cuisine features sorghum, millet, and cattle products. Known for kisra flatbread and asida porridge." },
  { country_name: "Spain", country_code: "ESP", main_cuisine: "Spanish", cuisine_description: "Spanish cuisine features olive oil, garlic, and regional specialties. Known for paella, tapas, jamón, and gazpacho." },
  { country_name: "Sri Lanka", country_code: "LKA", main_cuisine: "Sri Lankan", cuisine_description: "Sri Lankan cuisine features rice, coconut, and spices. Known for hoppers, kottu roti, and Ceylon tea." },
  { country_name: "Sudan", country_code: "SDN", main_cuisine: "Sudanese", cuisine_description: "Sudanese cuisine features sorghum, millet, and mutton. Known for ful medames and kisra flatbread." },
  { country_name: "Suriname", country_code: "SUR", main_cuisine: "Surinamese", cuisine_description: "Surinamese cuisine combines Dutch, Indian, and Creole influences with rice, curry, and tropical fruits." },
  { country_name: "Sweden", country_code: "SWE", main_cuisine: "Swedish", cuisine_description: "Swedish cuisine features fish, potatoes, and berries. Known for meatballs, gravlax, and aquavit." },
  { country_name: "Switzerland", country_code: "CHE", main_cuisine: "Swiss", cuisine_description: "Swiss cuisine features cheese, chocolate, and alpine ingredients. Known for fondue, rösti, and raclette." },
  { country_name: "Syria", country_code: "SYR", main_cuisine: "Syrian", cuisine_description: "Syrian cuisine features rice, lamb, and olive oil. Known for kibbeh, fattoush salad, and baklava." },
  { country_name: "Taiwan", country_code: "TWN", main_cuisine: "Taiwanese", cuisine_description: "Taiwanese cuisine combines Chinese influences with local ingredients. Known for beef noodle soup, bubble tea, and night market snacks." },
  { country_name: "Tajikistan", country_code: "TJK", main_cuisine: "Tajik", cuisine_description: "Tajik cuisine features rice, mutton, and bread. Known for plov pilaf, mantu dumplings, and green tea." },
  { country_name: "Tanzania", country_code: "TZA", main_cuisine: "Tanzanian", cuisine_description: "Tanzanian cuisine features ugali, rice, and grilled meats. Known for nyama choma barbecue and pilau rice." },
  { country_name: "Thailand", country_code: "THA", main_cuisine: "Thai", cuisine_description: "Thai cuisine balances sweet, sour, salty, and spicy flavors using ingredients like lemongrass, galangal, and fish sauce. Known for pad thai, green curry, and tom yum soup." },
  { country_name: "Timor-Leste", country_code: "TLS", main_cuisine: "Timorese", cuisine_description: "Timorese cuisine combines Portuguese and Indonesian influences with rice, corn, and tropical fruits." },
  { country_name: "Togo", country_code: "TGO", main_cuisine: "Togolese", cuisine_description: "Togolese cuisine features corn, yams, and palm oil. Known for fufu starch and grilled fish with spicy sauces." },
  { country_name: "Tonga", country_code: "TON", main_cuisine: "Tongan", cuisine_description: "Tongan cuisine features root vegetables, pork, and coconut. Known for lu sipi lamb in taro leaves and 'ota 'ika raw fish." },
  { country_name: "Trinidad and Tobago", country_code: "TTO", main_cuisine: "Trinidadian", cuisine_description: "Trinidadian cuisine combines Caribbean, Indian, and African influences. Known for doubles, roti, and callaloo." },
  { country_name: "Tunisia", country_code: "TUN", main_cuisine: "Tunisian", cuisine_description: "Tunisian cuisine features couscous, olive oil, and harissa. Known for brik pastry and mint tea." },
  { country_name: "Turkey", country_code: "TUR", main_cuisine: "Turkish", cuisine_description: "Turkish cuisine features kebabs, rice, and baklava. Known for döner, Turkish delight, and strong coffee." },
  { country_name: "Turkmenistan", country_code: "TKM", main_cuisine: "Turkmen", cuisine_description: "Turkmen cuisine features mutton, rice, and bread. Known for plov pilaf, manty dumplings, and camel milk." },
  { country_name: "Tuvalu", country_code: "TUV", main_cuisine: "Tuvaluan", cuisine_description: "Tuvaluan cuisine features coconut, fish, and taro. Known for palusami and coconut crab." },
  { country_name: "Uganda", country_code: "UGA", main_cuisine: "Ugandan", cuisine_description: "Ugandan cuisine features bananas, groundnuts, and fish. Known for matoke cooked bananas and posho cornmeal." },
  { country_name: "Ukraine", country_code: "UKR", main_cuisine: "Ukrainian", cuisine_description: "Ukrainian cuisine features beets, cabbage, and grains. Known for borscht, varenyky dumplings, and salo pork fat." },
  { country_name: "United Arab Emirates", country_code: "ARE", main_cuisine: "Emirati", cuisine_description: "Emirati cuisine features rice, dates, and seafood. Known for machboos, luqaimat, and Arabic coffee." },
  { country_name: "United Kingdom", country_code: "GBR", main_cuisine: "British", cuisine_description: "British cuisine features roasts, fish and chips, and tea. Known for Sunday roast, shepherd's pie, and afternoon tea." },
  { country_name: "United States", country_code: "USA", main_cuisine: "American", cuisine_description: "American cuisine is diverse with regional specialties, BBQ, and fusion foods. Known for hamburgers, apple pie, and craft beer." },
  { country_name: "Uruguay", country_code: "URY", main_cuisine: "Uruguayan", cuisine_description: "Uruguayan cuisine features beef, wine, and mate tea. Known for asado barbecue, chivito sandwich, and dulce de leche." },
  { country_name: "Uzbekistan", country_code: "UZB", main_cuisine: "Uzbek", cuisine_description: "Uzbek cuisine features rice, mutton, and bread. Known for plov pilaf, lagman noodles, and green tea." },
  { country_name: "Vanuatu", country_code: "VUT", main_cuisine: "Vanuatuan", cuisine_description: "Vanuatuan cuisine features root vegetables, coconut, and lap lap earth oven dishes." },
  { country_name: "Vatican City", country_code: "VAT", main_cuisine: "Italian", cuisine_description: "Vatican cuisine reflects Italian traditions with pasta, wine, and religious feast foods." },
  { country_name: "Venezuela", country_code: "VEN", main_cuisine: "Venezuelan", cuisine_description: "Venezuelan cuisine features corn, black beans, and tropical fruits. Known for arepas, pabellón, and rum." },
  { country_name: "Vietnam", country_code: "VNM", main_cuisine: "Vietnamese", cuisine_description: "Vietnamese cuisine features rice, herbs, and fish sauce. Known for pho soup, banh mi sandwiches, and fresh spring rolls." },
  { country_name: "Yemen", country_code: "YEM", main_cuisine: "Yemeni", cuisine_description: "Yemeni cuisine features rice, lamb, and honey. Known for saltah stew, mandi rice, and Yemeni coffee." },
  { country_name: "Zambia", country_code: "ZMB", main_cuisine: "Zambian", cuisine_description: "Zambian cuisine features maize, fish, and vegetables. Known for nshima cornmeal staple and bream fish." },
  { country_name: "Zimbabwe", country_code: "ZWE", main_cuisine: "Zimbabwean", cuisine_description: "Zimbabwean cuisine features corn, beef, and vegetables. Known for sadza cornmeal, biltong, and mazanje fruit." }
]

async function clearAndPopulateCountries() {
  try {
    console.log('🧹 Clearing existing countries and restaurants...')
    
    // Get all existing countries to delete their IDs
    const { data: existingCountries } = await supabase.from('countries').select('id')
    
    if (existingCountries && existingCountries.length > 0) {
      // Delete all existing restaurants first (foreign key constraint)
      const { error: restaurantsError } = await supabase.from('restaurants').delete().in('id', existingCountries.map(() => '').concat(['dummy']))
      
      // Just delete all restaurants using a range that covers everything
      const { error: restaurantsErrorAll } = await supabase.rpc('delete_all_restaurants')
      
      // Delete all countries one by one to avoid syntax issues
      for (const country of existingCountries) {
        await supabase.from('countries').delete().eq('id', country.id)
      }
      console.log(`✅ Cleared ${existingCountries.length} countries and restaurants`)
    } else {
      console.log('✅ No existing data to clear')
    }

    console.log('🌍 Adding 195 countries with 2-letter codes...')
    
    // Convert and insert all countries
    const countriesToInsert = countriesData.map(country => ({
      id: uuidv4(),
      name: country.country_name,
      country_code: iso3to2[country.country_code] || country.country_code, // Convert to 2-letter or keep original
      cuisine_style: country.main_cuisine,
      visit_count: 0,
      color_intensity: 0
    }))

    // Insert in batches to avoid hitting limits
    const batchSize = 50
    for (let i = 0; i < countriesToInsert.length; i += batchSize) {
      const batch = countriesToInsert.slice(i, i + batchSize)
      const { data, error } = await supabase
        .from('countries')
        .insert(batch)
      
      if (error) {
        console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error)
        throw error
      }
      
      console.log(`✅ Inserted batch ${i / batchSize + 1}/${Math.ceil(countriesToInsert.length / batchSize)} (${batch.length} countries)`)
    }

    console.log('🎉 Successfully added all 195 countries!')
    
    // Verify the count
    const { count } = await supabase
      .from('countries')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Total countries in database: ${count}`)
    
    // Show some examples
    const { data: examples } = await supabase
      .from('countries')
      .select('name, country_code, cuisine_style')
      .in('country_code', ['FR', 'IN', 'US', 'JP', 'IT', 'DE'])
      .order('name')
    
    console.log('🔍 Example countries with 2-letter codes:')
    examples?.forEach(country => {
      console.log(`  ${country.name} (${country.country_code}): ${country.cuisine_style}`)
    })

  } catch (error) {
    console.error('💥 Error:', error)
    process.exit(1)
  }
}

// Run the script
clearAndPopulateCountries()