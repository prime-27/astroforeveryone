// Fact sheets and orbit layout for the 3D Solar System, carried over unchanged from Dr Ravi Raja Pothineni's original tool.
// Orbits (a) and sizes are display units, not to scale; periods are in days.

export const FACTS = {
    "sun": {
        name: "The Sun (Sol)", type: "Central Star (Yellow Dwarf G2V)",
        dist: "0.00 AU (Center)", period: "230 Million Yrs (Galactic)", vel: "230 km/s (Galactic)", inc: "7.25° (to Ecliptic)",
        diam: "1,392,700 km (109 Earths)", mass: "1.989 × 10³⁰ kg (333,000 M⊕)", grav: "274.0 m/s² (28.0 g)", temp: "5,500°C (Surface) / 15M°C (Core)",
        atmo: "73.46% Hydrogen, 24.85% Helium, 0.77% Oxygen", moons: "8 Planets, 5 Dwarf Planets, Millions of Asteroids & Comets",
        desc: "The Sun accounts for 99.86% of the entire mass in the Solar System. Its core sustains continuous thermonuclear fusion of hydrogen into helium at 15 million Kelvin, generating solar radiation that powers all planetary atmospheres, photochemistry, and magnetospheres."
    },
    "mercury": {
        name: "Mercury", type: "Terrestrial Planet (Innermost)",
        dist: "0.387 AU (57.9M km)", period: "87.97 Days (0.24 Yrs)", vel: "47.36 km/s", inc: "7.00°",
        diam: "4,879 km (0.38 Earths)", mass: "3.301 × 10²³ kg (0.055 M⊕)", grav: "3.70 m/s² (0.38 g)", temp: "-180°C to +430°C",
        atmo: "Surface-Bound Exosphere (Oxygen, Sodium, Hydrogen, Helium)", moons: "0 (No Natural Satellites)",
        desc: "The smallest major planet, possessing a giant iron core that occupies 85% of its radius. Locked in a 3:2 spin-orbit resonance (rotating 3 times for every 2 orbits). Permanently shadowed craters at its north and south poles contain extensive deposits of pure water ice."
    },
    "venus": {
        name: "Venus", type: "Terrestrial Planet (Greenhouse World)",
        dist: "0.723 AU (108.2M km)", period: "224.70 Days (0.62 Yrs)", vel: "35.02 km/s", inc: "3.39°",
        diam: "12,104 km (0.95 Earths)", mass: "4.867 × 10²⁴ kg (0.815 M⊕)", grav: "8.87 m/s² (0.90 g)", temp: "+465°C (Hottest in Solar System)",
        atmo: "96.5% CO₂, 3.5% N₂ (92 bar surface pressure, H₂SO₄ clouds)", moons: "0 (No Natural Satellites)",
        desc: "Earth's twin in size and mass, but enveloped in a runaway greenhouse atmosphere with surface pressures equal to 900 meters ocean depth. Rotates retrograde (clockwise, 243 days/turn) with cloud decks undergoing super-rotation in just 4 Earth days."
    },
    "earth": {
        name: "Earth (Terra / Prithvi)", type: "Terrestrial Planet (Habitable World)",
        dist: "1.000 AU (149.6M km)", period: "365.256 Days (1.00 Yr)", vel: "29.78 km/s", inc: "0.00° (Reference Plane)",
        diam: "12,742 km (1.00 Earths)", mass: "5.972 × 10²⁴ kg (1.00 M⊕)", grav: "9.807 m/s² (1.00 g)", temp: "+15°C Average (-89°C to +57°C)",
        atmo: "78.08% N₂, 20.95% O₂, 0.93% Ar, 0.04% CO₂, H₂O vapor", moons: "1 Confirmed (The Moon / Luna)",
        desc: "The only known astronomical body to support active biology. Features a dynamic hydrological cycle, plate tectonics, an active geodynamo producing a protective geomagnetic shield, and a large natural satellite that stabilizes its 23.44° obliquity."
    },
    "mars": {
        name: "Mars", type: "Terrestrial Planet (Red Planet)",
        dist: "1.524 AU (227.9M km)", period: "686.98 Days (1.88 Yrs)", vel: "24.07 km/s", inc: "1.85°",
        diam: "6,779 km (0.53 Earths)", mass: "6.417 × 10²³ kg (0.107 M⊕)", grav: "3.72 m/s² (0.38 g)", temp: "-60°C Average (-140°C to +20°C)",
        atmo: "95.3% CO₂, 2.6% N₂, 1.9% Ar, 0.16% O₂ (6.1 mbar)", moons: "2 Confirmed (Phobos & Deimos)",
        desc: "Home to the largest volcano in the Solar System (Olympus Mons, 22 km tall) and the massive canyon network Valles Marineris. Abundant evidence confirms past liquid water oceans, lakes, and river deltas, with substantial sub-surface permafrost and polar water-ice caps."
    },
    "jupiter": {
        name: "Jupiter", type: "Gas Giant (Jovian System)",
        dist: "5.204 AU (778.5M km)", period: "4332.59 Days (11.86 Yrs)", vel: "13.07 km/s", inc: "1.30°",
        diam: "139,820 km (11.0 Earths)", mass: "1.898 × 10²⁷ kg (317.8 M⊕)", grav: "24.79 m/s² (2.53 g)", temp: "-110°C (1-bar cloud level)",
        atmo: "89.8% Hydrogen (H₂), 10.2% Helium (He), trace CH₄, NH₃", moons: "115 Confirmed Moons (IAU / MPC official tally)",
        desc: "Contains more mass than all other planets combined (2.5x total). Features the centuries-old Great Red Spot anticyclone, a deep metallic hydrogen convective dynamo generating the strongest planetary magnetosphere, and the four large Galilean satellites: Io, Europa, Ganymede, and Callisto."
    },
    "saturn": {
        name: "Saturn", type: "Gas Giant (King of Moons)",
        dist: "9.582 AU (1.433B km)", period: "10759.22 Days (29.45 Yrs)", vel: "9.68 km/s", inc: "2.49°",
        diam: "116,460 km (9.14 Earths)", mass: "5.683 × 10²⁶ kg (95.16 M⊕)", grav: "10.44 m/s² (1.06 g)", temp: "-140°C (1-bar cloud level)",
        atmo: "96.3% Hydrogen (H₂), 3.25% Helium (He), 0.45% Methane", moons: "293 Confirmed Moons (IAU / NASA official tally)",
        desc: "Leads the Solar System with 293 confirmed natural satellites. Hosts a grand ring system composed of 99% pure water-ice particles spanning 282,000 km but only ~10 meters thick. Its moons include Titan (possessing a thick nitrogen atmosphere and methane lakes) and cryovolcanic Enceladus."
    },
    "uranus": {
        name: "Uranus", type: "Ice Giant (Tilted World)",
        dist: "19.201 AU (2.871B km)", period: "30685.4 Days (84.02 Yrs)", vel: "6.80 km/s", inc: "0.77°",
        diam: "50,724 km (3.98 Earths)", mass: "8.681 × 10²⁵ kg (14.54 M⊕)", grav: "8.69 m/s² (0.89 g)", temp: "-195°C (-224°C record minimum)",
        atmo: "82.5% H₂, 15.2% He, 2.3% Methane (CH₄ giving cyan hue)", moons: "29 Confirmed Moons (including S/2023 U1 & S/2025 U1)",
        desc: "Rotates virtually on its side with an axial tilt of 97.77°, producing 42-year-long polar seasons. Enclosed by a complex system of 13 narrow dark rings and 29 confirmed moons named after characters from Shakespeare and Alexander Pope, including Titania, Oberon, and fractured Miranda."
    },
    "neptune": {
        name: "Neptune", type: "Ice Giant (Outer Sentinel)",
        dist: "30.047 AU (4.495B km)", period: "60189.0 Days (164.8 Yrs)", vel: "5.43 km/s", inc: "1.77°",
        diam: "49,244 km (3.86 Earths)", mass: "1.024 × 10²⁶ kg (17.15 M⊕)", grav: "11.15 m/s² (1.14 g)", temp: "-200°C (Average)",
        atmo: "80.0% H₂, 19.0% He, 1.5% Methane (Deep Azure Blue)", moons: "16 Confirmed Moons (including Triton, S/2002 N5, S/2021 N1)",
        desc: "The windiest world in the Solar System, with supersonic storm speeds exceeding 2,100 km/h. Its largest moon, Triton, is a captured Kuiper Belt dwarf planet orbiting retrograde with active nitrogen geysers, exhibiting a surface temperature of -235°C."
    },
    "ceres": {
        name: "1 Ceres", type: "Dwarf Planet (Asteroid Belt)",
        dist: "2.767 AU (413.9M km)", period: "1682.0 Days (4.61 Yrs)", vel: "17.88 km/s", inc: "10.59°",
        diam: "939.4 km (0.074 Earths)", mass: "9.38 × 10²⁰ kg (0.00015 M⊕)", grav: "0.28 m/s² (0.029 g)", temp: "-105°C Average",
        atmo: "Transient water-vapor exosphere", moons: "0 (No Natural Satellites)",
        desc: "The largest object in the main asteroid belt, accounting for one-third of the belt's total mass. NASA's Dawn mission discovered bright sodium-carbonate salt deposits in Occator Crater and confirmed a water-ice-rich rocky mantle."
    },
    "pluto": {
        name: "134340 Pluto", type: "Dwarf Planet (Kuiper Belt / Plutino)",
        dist: "39.482 AU (5.906B km)", period: "90560.0 Days (248.0 Yrs)", vel: "4.74 km/s", inc: "17.16°",
        diam: "2,376.6 km (0.186 Earths)", mass: "1.303 × 10²² kg (0.0022 M⊕)", grav: "0.62 m/s² (0.063 g)", temp: "-230°C Average",
        atmo: "Tenuous Nitrogen, Methane, Carbon Monoxide (collapses at aphelion)", moons: "5 Confirmed (Charon, Styx, Nix, Kerberos, Hydra)",
        desc: "Binary dwarf planet system locked in a 2:3 orbital resonance with Neptune. Charon is half Pluto's diameter, placing their mutual barycenter in open space between them. Features actively convecting nitrogen glaciers at Sputnik Planitia and water-ice mountains."
    },
    "haumea": {
        name: "136108 Haumea", type: "Dwarf Planet (Kuiper Belt)",
        dist: "43.218 AU (6.465B km)", period: "103774.0 Days (284.1 Yrs)", vel: "4.53 km/s", inc: "28.19°",
        diam: "2,100 × 1,680 × 1,074 km (Triaxial Ellipsoid)", mass: "4.01 × 10²¹ kg (0.0007 M⊕)", grav: "0.40 m/s²", temp: "-241°C",
        atmo: "None detected", moons: "2 Confirmed (Hiʻiaka & Namaka) + Ring System",
        desc: "Spins once every 3.9 hours—the fastest rotation of any large equilibrium body in the Solar System—stretching it into an elongated triaxial ellipsoid. Encircled by its own dense ring system and two icy satellites."
    },
    "makemake": {
        name: "136472 Makemake", type: "Dwarf Planet (Classical Kuiper Belt)",
        dist: "45.791 AU (6.850B km)", period: "113187.0 Days (309.9 Yrs)", vel: "4.41 km/s", inc: "28.96°",
        diam: "1,430 km (0.11 Earths)", mass: "3.10 × 10²¹ kg (0.0005 M⊕)", grav: "0.50 m/s²", temp: "-243°C",
        atmo: "Trace methane glaze", moons: "1 Confirmed (MK2 / S/2015 1)",
        desc: "The second brightest Kuiper Belt object in the night sky after Pluto. Its surface is coated in frozen methane, ethane, and tholins, with an orbital period of over 300 years. Its moon, MK2, was discovered by the Hubble Space Telescope in 2016."
    },
    "eris": {
        name: "136199 Eris", type: "Dwarf Planet (Scattered Disk)",
        dist: "67.781 AU (10.14B km)", period: "203830.0 Days (558.0 Yrs)", vel: "3.43 km/s", inc: "44.04°",
        diam: "2,326 km (0.182 Earths)", mass: "1.66 × 10²² kg (0.0028 M⊕, 27% > Pluto)", grav: "0.82 m/s² (0.084 g)", temp: "-243°C Average",
        atmo: "Frozen methane glaze (sublimates near perihelion at 38 AU)", moons: "1 Confirmed (Dysnomia)",
        desc: "The most massive known dwarf planet, situated in the highly inclined scattered disk. Its discovery in 2005 prompted the International Astronomical Union (IAU) to formalize the definition of a planet and establish the dwarf planet classification in 2006."
    }
};

export const BODIES = [
    { id: "mercury", a: 6.0, period: 87.97, size: 0.28, col: 0xA5A5A5 },
    { id: "venus", a: 9.0, period: 224.70, size: 0.46, col: 0xE3BB7B },
    { id: "earth", a: 13.0, period: 365.25, size: 0.50, col: 0x0284C7 },
    { id: "mars", a: 18.0, period: 686.98, size: 0.36, col: 0xEF4444 },
    { id: "ceres", a: 21.5, period: 1682.0, size: 0.18, col: 0x94A3B8, dwarf: true },
    { id: "jupiter", a: 27.0, period: 4332.59, size: 1.15, col: 0xF59E0B },
    { id: "saturn", a: 36.0, period: 10759.22, size: 0.95, col: 0xFDE68A, rings: true },
    { id: "uranus", a: 44.0, period: 30685.4, size: 0.68, col: 0x38BDF8 },
    { id: "neptune", a: 52.0, period: 60189.0, size: 0.65, col: 0x3B82F6 },
    { id: "pluto", a: 58.0, period: 90560.0, size: 0.22, col: 0xD7CCC8, dwarf: true },
    { id: "haumea", a: 63.0, period: 103774.0, size: 0.20, col: 0xCFD8DC, dwarf: true },
    { id: "makemake", a: 67.0, period: 113187.0, size: 0.21, col: 0xFFCCBC, dwarf: true },
    { id: "eris", a: 73.0, period: 203830.0, size: 0.22, col: 0xF5F5F5, dwarf: true }
];
