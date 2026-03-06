export type CasePhoto = {
  id: string;
  image: string;
  title: string;
  source: string;
  sourceUrl: string;
};

export type CaseVideo = {
  id: string;
  title: string;
  videoId: string;
  source: string;
  sourceUrl: string;
  thumbnail: string;
};

export const SHARED_WHITE_KIA_IMAGE = "/media/case/white-kia-reference.jpg";
export const SHARED_NANCY_COVER_IMAGE = "/media/case/nancy-cover.jpg";

export const nancyPublicPhotos: CasePhoto[] = [
  {
    id: "nancy-cover-shared",
    image: SHARED_NANCY_COVER_IMAGE,
    title: "Nancy Guthrie public cover image",
    source: "Provided share link",
    sourceUrl: "https://share.google/fTQFr0SE5yGXvZncE",
  },
  {
    id: "vehicle-shared-white-kia",
    image: SHARED_WHITE_KIA_IMAGE,
    title: "White Kia Soul reference image",
    source: "Provided share link",
    sourceUrl: "https://share.google/ydcdLMJR71m4dPoVI",
  },
  {
    id: "nancy-vgt-main",
    image: "https://c1.vgtstatic.com/thumb/3/0/304766-v1-half/nancy-guthries-house.jpg",
    title: "Nancy Guthrie location context image",
    source: "VirtualGlobetrotting",
    sourceUrl: "https://virtualglobetrotting.com/map/nancy-guthries-house/view/google/",
  },
  {
    id: "nancy-fox-day32",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfKmyLOUIkp5FLpbvyHfj_0Ee-GGhB-2nlgQ&s",
    title: "Nancy Guthrie disappearance coverage",
    source: "FOX 10 Phoenix",
    sourceUrl: "https://www.fox10phoenix.com/news/nancy-guthrie-disappearance-day-32-latest-updates",
  },
  {
    id: "nancy-video-thumb-1",
    image: "/media/case/video-zyrx.jpg",
    title: "Case-related YouTube visual",
    source: "YouTube",
    sourceUrl: "https://www.youtube.com/watch?v=ZYRxIWAWDQo",
  },
  {
    id: "nancy-video-thumb-2",
    image: "/media/case/video-gdyn.jpg",
    title: "Case-related YouTube visual",
    source: "YouTube",
    sourceUrl: "https://www.youtube.com/watch?v=Gdyn7V4kv9g",
  },
];

export const seededCaseVideos: CaseVideo[] = [
  {
    id: "yt-zyrx",
    title: "Nancy Guthrie: New message received on woman's disappearance",
    videoId: "ZYRxIWAWDQo",
    source: "YouTube",
    sourceUrl: "https://www.youtube.com/watch?v=ZYRxIWAWDQo",
    thumbnail: "/media/case/video-zyrx.jpg",
  },
  {
    id: "yt-gdyn",
    title: "Nancy Guthrie disappearance: What we know",
    videoId: "Gdyn7V4kv9g",
    source: "YouTube",
    sourceUrl: "https://www.youtube.com/watch?v=Gdyn7V4kv9g",
    thumbnail: "/media/case/video-gdyn.jpg",
  },
];
