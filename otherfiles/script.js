const apiKey = 'AIzaSyCm7DGE-kap659P9wGFT6ofvXv2tBCh5as';
const channelId = 'UCc8LOQgM3_fq7ETBFzg6Y1g';

async function fetchSubscribers() {
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`);
    const data = await res.json();
    const count = data.items[0].statistics.subscriberCount;
    document.getElementById('subscriberCount').innerText = `${Number(count).toLocaleString()} Subscribers`;
  } catch (err) {
    document.getElementById('subscriberCount').innerText = 'Error loading subs';
    console.error(err);
  }
}

async function fetchVideosData() {
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=50`);
    const searchData = await res.json();

    const videoIds = searchData.items
      .filter(item => item.id.kind === 'youtube#video')
      .map(item => item.id.videoId)
      .join(',');

    const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${apiKey}`);
    const statsData = await statsRes.json();

    const videos = statsData.items.map(video => ({
      title: video.snippet.title,
      views: Number(video.statistics.viewCount || 0),
      likes: Number(video.statistics.likeCount || 0),
      id: video.id,
    }));

    const topViewed = [...videos].sort((a, b) => b.views - a.views).slice(0, 5);
    const topLiked = [...videos].sort((a, b) => b.likes - a.likes).slice(0, 5);

    const topViewedList = document.getElementById('topViewedVideos');
    const topLikedList = document.getElementById('topLikedVideos');

    topViewed.forEach(video => {
        topViewedList.innerHTML += `
          <li>
            <img class="video-thumbnail" src="https://i.ytimg.com/vi/${video.id}/mqdefault.jpg" alt="Thumbnail">
            <div class="video-info">
              <a class="video-title" href="https://youtu.be/${video.id}" target="_blank">${video.title}</a>
              <div class="video-stats">${video.views.toLocaleString()} views</div>
            </div>
          </li>
        `;
      });
      
      topLiked.forEach(video => {
        topLikedList.innerHTML += `
          <li>
            <img class="video-thumbnail" src="https://i.ytimg.com/vi/${video.id}/mqdefault.jpg" alt="Thumbnail">
            <div class="video-info">
              <a class="video-title" href="https://youtu.be/${video.id}" target="_blank">${video.title}</a>
              <div class="video-stats">${video.likes.toLocaleString()} likes</div>
            </div>
          </li>
        `;
      });
      

  } catch (error) {
    console.error("Error fetching videos:", error);
  }
}

async function fetchTopComments() {
  try {
    const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=id&order=date&maxResults=1`);
    const latestVideoId = videoRes.ok ? (await videoRes.json()).items[0].id.videoId : null;

    if (!latestVideoId) return;

    const commentsRes = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?key=${apiKey}&textFormat=plainText&part=snippet&videoId=${latestVideoId}&maxResults=5`);
    const commentsData = await commentsRes.json();

    const commentsList = document.getElementById('topComments');
    commentsData.items.forEach(comment => {
      const text = comment.snippet.topLevelComment.snippet.textDisplay;
      const author = comment.snippet.topLevelComment.snippet.authorDisplayName;
      commentsList.innerHTML += `<li><strong>${author}:</strong> ${text}</li>`;
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
  }
}

// Load all
fetchSubscribers();
fetchVideosData();
fetchTopComments();
setInterval(fetchSubscribers, 10000); // Refresh sub count every 10s
