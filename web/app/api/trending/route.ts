import { NextRequest, NextResponse } from 'next/server';
import { Innertube } from 'youtubei.js/web';

export async function GET(request: NextRequest) {
  try {
    // Initialize Innertube
    const innertube = await Innertube.create();

    // Fetch trending feed
    const trendingFeed = await innertube.getTrending();

    // List all available tabs
    const tabs = trendingFeed.tabs;

    // Build response data
    const responseData: Record<string, any> = {
      availableTabs: tabs,
    };

    // Optionally fetch content for a specific tab
    const searchParams = request.nextUrl.searchParams;
    let tabName = searchParams.get('tab'); // Allow querying specific tab by name

    // Set default tabName to "Now" if not provided or invalid
    if (!tabName || !tabs.includes(tabName)) {
      tabName = 'Now';
    }

    // Fetch content for the determined tab
    const selectedTab = await trendingFeed.getTabByName(tabName);
    responseData.selectedTabContent = selectedTab.videos
      .slice(0, 10) // Limit to 10 videos
      .map((video: any) => ({
        title: video.title,
        videoId: video.id,
        thumbnails: video.thumbnails,
      }));

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Error interacting with TabbedFeed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending content', details: error.message },
      { status: 500 }
    );
  }
}
