function searchVideo() {
  const query = document.getElementById("searchInput").value;
  const iframe = document.getElementById("ytplayer");

  // Load first search result using YouTube search embed
  iframe.src = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}`;
}
