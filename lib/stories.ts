// LIGHT in 2026, from the posts on @children_ofthelight (everything after Feb 13, 2026).

export type Story = {
  id: string;
  title: string;
  /** ISO date of the drop or post. */
  date: string;
  when: string;
  /** In the brand's own words where it said something worth repeating. */
  text: string;
  images: string[];
  products: number[];
  credit?: string;
  surface: "night" | "day";
};

export const STORIES: Story[] = [
  {
    id: "jesus-lives",
    title: "Jesus Lives",
    date: "2026-04-03",
    when: "Good Friday, April 3",
    text: "Released on Good Friday: chrome-printed, oversized tees for the Christ who still lives.",
    images: ["DaobnhQEawZ-1", "DbB4lwEnCwL-2", "DcZ3A7_kdYU-1", "DWFCOKkD8nw-2", "DaobnhQEawZ-4"],
    products: [9107472154764],
    credit: "Photographed by @kdshot_it and @mediabymarky",
    surface: "day",
  },
  {
    id: "light-resurgence",
    title: "Light Resurgence",
    date: "2026-06-27",
    when: "June 27",
    text: "Jesus Wept, John 11:35, embroidered into a scarf hood. Shot in white, in the shade.",
    images: ["DaHD4q5jWT--2", "DaHD4q5jWT--6", "DaHD4q5jWT--4", "DaHD4q5jWT--1"],
    products: [7861896413324],
    credit: "Photographed by @kemflics and @kdshot_it",
    surface: "day",
  },
  {
    id: "summer",
    title: "Light4eva summer",
    date: "2026-07-03",
    when: "July 3",
    text: "Skull caps, women's Light4eva tees and Light4eva bags. Everything reflective, made to catch the flash.",
    images: ["DaRMxaqkUKj-1", "DaJvqbyEe0Y-3", "DaJvqbyEe0Y-7", "DaRMxaqkUKj-4", "DaJvqbyEe0Y-1"],
    products: [9535087739020, 9535045107852, 9162324377740],
    surface: "day",
  },
  {
    id: "children-of-the-light",
    title: "Children of the Light",
    date: "2026-06-04",
    when: "June 4",
    text: "The Light × P.G jacket: distressed, zipped, a crowned cross on the back.",
    images: ["DZLeRuQFFSn-0", "DZLeRuQFFSn-5", "DZLeRuQFFSn-3", "DZLeRuQFFSn-8"],
    products: [8120992235660, 8120874107020],
    credit: "Photographed by @kyng.archives and @kdshot_it",
    surface: "day",
  },
  {
    id: "skull-caps",
    title: "Light skull caps",
    date: "2026-02-14",
    when: "February 14",
    text: "The first drop of the year. Post your skully and tag us.",
    images: ["DU1ziiQkcVO-0", "DU1ziiQkcVO-2", "DU1ziiQkcVO-5", "DUv8vnPj26B-2"],
    products: [9162324377740],
    surface: "day",
  },
];

export type Milestone = { date: string; label: string; text: string; image?: string; href?: string };

export const TIMELINE: Milestone[] = [
  { date: "2026-02-14", label: "Feb 14", text: "Light skull caps drop. The first release of the year.", image: "DUv8vnPj26B-0" },
  { date: "2026-03-23", label: "Mar 23", text: "“Light 4eva. More than just fashion. Light is what I call a God Vision.”" },
  { date: "2026-04-03", label: "Apr 3", text: "Jesus Lives tees release on Good Friday.", image: "DWpYn2lj0Yf-0" },
  { date: "2026-06-04", label: "Jun 4", text: "Children of the Light, shot in studio white.", image: "DZLeRuQFFSn-4" },
  { date: "2026-06-27", label: "Jun 27", text: "Light Resurgence: the Jesus Wept scarf tee in the garden.", image: "DaHD4q5jWT--3" },
  { date: "2026-07-03", label: "Jul 3", text: "Light4eva summer collection: skull caps, women's tees, reflective bags.", image: "DaJvqbyEe0Y-0" },
  { date: "2026-08-28", label: "Aug 28", text: "LIGHT announces its first solo show during New York Fashion Week, with a pop-up shop.", image: "Dclxg2wRFYs-0" },
  { date: "2026-09-13", label: "Sep 13", text: "The Light Fashion Experience. Sixteen looks, New York.", href: "/runway" },
  { date: "2026-09-20", label: "Sep 20", text: "The show collection is released.", href: "/shop" },
  { date: "2026-09-23", label: "Sep 23", text: "Forgiven jackets, one at a time.", href: "/shop/forgiven-jacket-black" },
];
