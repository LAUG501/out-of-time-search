declare module "yt-search" {
  type SearchVideo = {
    videoId: string;
    title: string;
    thumbnail?: string;
    ago?: string;
    author?: { name?: string };
  };

  type SearchResult = {
    videos: SearchVideo[];
  };

  type SearchOptions = {
    query: string;
    pages?: number;
  };

  function yts(options: SearchOptions): Promise<SearchResult>;

  export default yts;
}
