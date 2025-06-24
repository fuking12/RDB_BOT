const { cmd } = require("../command");
const axios = require('axios');
const NodeCache = require('node-cache');

// Initialize cache (1-minute TTL)
const searchCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// ======================
// MANJU_MD Theme
// ======================
const manjuTheme = {
  header: `📺 *MANJU_MD TV SERIES VAULT* 📺\n🔢 Cinesubz Details 🔢\n`,
  box: function(title, content) {
    return `${this.header}══════ 📽️ ${title} 📽️ ══════\n\n${content}\n\n══════ 📺 MANJU_MD 📺 ══════\nMᴀɴᴊᴜ_Mᴅ Cɪɴᴇsᴜʙᴢ Sɪᴩᴇ...`;
  },
  getForwardProps: function() {
    return {
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        stanzaId: "BAE5" + Math.random().toString(16).substr(2, 12).toUpperCase(),
        mentionedJid: [],
        conversionData: {
          conversionDelaySeconds: 0,
          conversionSource: "manju_md",
          conversionType: "message"
        }
      }
    };
  },
  resultEmojis: ["📽️", "📺", "🔢", "🎞️", "🎬", "🎭", "🎥", "🎟️", "🔍", "⬇️"]
};

// TV series search and download command
cmd({
  pattern: "series2",
  react: "📺",
  desc: "Explore TV series from MANJU_MD's vault with Sinhala subtitles",
  category: "series vault",
  filename: __filename,
}, async (conn, mek, m, { from, q, pushname }) => {
  if (!q) {
    await conn.sendMessage(from, {
      text: manjuTheme.box("Series Vault", 
        "📺 Usage: .series2 <series name>\n📺 Example: .series2 Family by Choice\n📺 Vault: TV Series with Sinhala Subtitles\n📺 Reply 'done' to stop"),
      ...manjuTheme.getForwardProps()
    }, { quoted: mek });
    return;
  }

  try {
    // Step 1: Check cache for series data
    const cacheKey = `series_search_${q.toLowerCase()}`;
    let cachedData = searchCache.get(cacheKey);

    let seriesData;
    if (!cachedData) {
      const searchUrl = `https://suhas-md-movie-api.vercel.app/api/cinesubz/tvshow/search/?q=${encodeURIComponent(q)}`;
      let retries = 3;
      while (retries > 0) {
        try {
          const searchResponse = await axios.get(searchUrl, { timeout: 10000 });
          const searchData = searchResponse.data;
          console.log("Search API Response:", JSON.stringify(searchData, null, 2));
          if (Array.isArray(searchData)) {
            seriesData = searchData; // Raw array
          } else if (Array.isArray(searchData.result?.data)) {
            seriesData = searchData.result.data;
          } else if (Array.isArray(searchData.data)) {
            seriesData = searchData.data;
          } else {
            throw new Error("No series data found in API response");
          }

          if (seriesData.length === 0) {
            throw new Error("No series found in Series Vault");
          }

          searchCache.set(cacheKey, { seriesData }); // Cache the seriesData
          break;
        } catch (error) {
          console.error(`Search API Error: ${error.message}, Retries left: ${retries}`);
          retries--;
          if (retries === 0) throw new Error("Failed to retrieve data from series vault");
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } else {
      // Use cached data
      seriesData = cachedData.seriesData;
      if (!seriesData || seriesData.length === 0) {
        throw new Error("No series found in cached data");
      }
    }

    // Step 2: Format series list
    let seriesList = `📺 *CINESUBZ SERIES RESULTS* 📺\n\n`;
    const series = seriesData.map((show, index) => ({
      number: index + 1,
      title: show.title.replace("Sinhala Subtitles | සිංහල උපසිරසි සමඟ", "").trim() || "Unknown Title",
      link: show.link || ""
    }));

    series.forEach(show => {
      seriesList += `${manjuTheme.resultEmojis[0]} ${show.number} || *${show.title}*\n`;
    });
    seriesList += `\n${manjuTheme.resultEmojis[8]} Reply Below Number 🔢\n`;
    seriesList += `${manjuTheme.resultEmojis[9]} Reply 'done' to stop\n`;

    const seriesListMessage = await conn.sendMessage(from, {
      text: manjuTheme.box("Series Selection", seriesList),
      ...manjuTheme.getForwardProps()
    }, { quoted: mek });

    const seriesListMessageKey = seriesListMessage.key;

    // Step 3: Track selections with a Map
    const selectionMap = new Map();

    // Step 4: Handle series, episode, and quality selections
    const selectionHandler = async (update) => {
      const message = update.messages[0];
      if (!message.message || !message.message.extendedTextMessage) return;

      const replyText = message.message.extendedTextMessage.text.trim();
      const repliedToId = message.message.extendedTextMessage.contextInfo.stanzaId;

      // Exit condition
      if (replyText.toLowerCase() === "done") {
        conn.ev.off("messages.upsert", selectionHandler);
        selectionMap.clear();
        await conn.sendMessage(from, {
          text: manjuTheme.box("Vault Closed", 
            "📺 Series quest ended!\n📺 Return to the Series Vault anytime"),
          ...manjuTheme.getForwardProps()
        }, { quoted: message });
        return;
      }

      // Series selection
      if (repliedToId === seriesListMessageKey.id) {
        const selectedNumber = parseInt(replyText);
        const selectedSeries = series.find(show => show.number === selectedNumber);

        if (!selectedSeries) {
          await conn.sendMessage(from, {
            text: manjuTheme.box("Vault Warning", 
              "📺 Invalid selection!\n📺 Choose a series number"),
            ...manjuTheme.getForwardProps()
          }, { quoted: message });
          return;
        }

        // Validate series link
        if (!selectedSeries.link || !selectedSeries.link.startsWith('http')) {
          await conn.sendMessage(from, {
            text: manjuTheme.box("Vault Warning", 
              "📺 Invalid series link provided\n📺 Please select another series"),
            ...manjuTheme.getForwardProps()
          }, { quoted: message });
          return;
        }

        // Fetch series details
        const detailsUrl = `https://suhas-md-movie-api.vercel.app/api/cinesubz/tvshow/details?url=${encodeURIComponent(selectedSeries.link)}`;
        let seriesDetails;
        let detailsRetries = 3;

        while (detailsRetries > 0) {
          try {
            const detailsResponse = await axios.get(detailsUrl, { timeout: 10000 });
            seriesDetails = detailsResponse.data;
            console.log("Details API Response:", JSON.stringify(seriesDetails, null, 2));
            // Handle the current API response structure
            if (Array.isArray(seriesDetails)) {
              seriesDetails = seriesDetails[0] || {};
            }
            break;
          } catch (error) {
            console.error(`Details API Error: ${error.message}, Retries left: ${detailsRetries}`);
            detailsRetries--;
            if (detailsRetries === 0) {
              await conn.sendMessage(from, {
                text: manjuTheme.box("Vault Warning", 
                  `📺 Failed to fetch series details: ${error.message}\n📺 Please try another series`),
                ...manjuTheme.getForwardProps()
              }, { quoted: message });
              return;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        // Extract details with fallback values
        const details = {
          title: seriesDetails.title || selectedSeries.title || "Unknown Title",
          image: seriesDetails.image || seriesDetails[0]?.image || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop",
          imdb: seriesDetails.imdb || seriesDetails[0]?.imdb || "N/A",
          release_date: seriesDetails.release_date || seriesDetails[0]?.date || seriesDetails[0]?.release_date || "N/A",
          description: seriesDetails.description || seriesDetails[0]?.description || "No description available"
        };

        let detailsCard = `${manjuTheme.resultEmojis[1]} *${details.title}*\n`;
        detailsCard += `${manjuTheme.resultEmojis[2]} IMDb: ${details.imdb}\n`;
        detailsCard += `${manjuTheme.resultEmojis[3]} Release: ${details.release_date}\n`;
        detailsCard += `${manjuTheme.resultEmojis[4]} Description: ${details.description}\n`;
        detailsCard += `\n${manjuTheme.resultEmojis[8]} Reply 'episodes' to view episode list\n`;
        detailsCard += `${manjuTheme.resultEmojis[9]} Reply 'get episode' to fetch episode list\n`;
        detailsCard += `${manjuTheme.resultEmojis[10]} Reply 'done' to stop\n`;

        const detailsMessage = await conn.sendMessage(from, {
          image: { url: details.image },
          caption: manjuTheme.box("Series Details", detailsCard),
          ...manjuTheme.getForwardProps()
        }, { quoted: message });

        // Store series details in Map
        selectionMap.set(detailsMessage.key.id, { series: selectedSeries, details });
      }
      // Episode list request
      else if (selectionMap.has(repliedToId) && (replyText.toLowerCase() === "episodes" || replyText.toLowerCase() === "get episode")) {
        const { series, details } = selectionMap.get(repliedToId);
        const episodes = details.episodes || [];

        if (episodes.length === 0) {
          await conn.sendMessage(from, {
            text: manjuTheme.box("Vault Warning", 
              "📺 No episodes available for this series\n📺 Please try another series"),
            ...manjuTheme.getForwardProps()
          }, { quoted: message });
          return;
        }

        let episodeList = `${manjuTheme.resultEmojis[1]} *${series.title} - Episodes*\n\n`;
        episodes.forEach((episode, index) => {
          episodeList += `${manjuTheme.resultEmojis[0]} ${index + 1}. *${episode.title || `Episode ${index + 1}`}*\n`;
        });
        episodeList += `\n${manjuTheme.resultEmojis[8]} Select episode: Reply with the number\n`;
        episodeList += `${manjuTheme.resultEmojis[9]} Reply 'done' to stop\n`;

        const episodeListMessage = await conn.sendMessage(from, {
          text: manjuTheme.box("Episode Selection", episodeList),
          ...manjuTheme.getForwardProps()
        }, { quoted: message });

        // Update Map with episode list
        selectionMap.set(episodeListMessage.key.id, { series, episodes });
      }
      // Episode selection
      else if (selectionMap.has(repliedToId) && selectionMap.get(repliedToId).episodes) {
        const { series, episodes } = selectionMap.get(repliedToId);
        const selectedEpisodeNumber = parseInt(replyText);
        const selectedEpisode = episodes[selectedEpisodeNumber - 1];

        if (!selectedEpisode) {
          await conn.sendMessage(from, {
            text: manjuTheme.box("Vault Warning", 
              "📺 Invalid episode selection!\n📺 Choose an episode number"),
            ...manjuTheme.getForwardProps()
          }, { quoted: message });
          return;
        }

        // Fetch download links
        const downloadUrl = `https://suhas-md-movie-api.vercel.app/api/cinesubz/tvshow/downloadlinks?url=${encodeURIComponent(selectedEpisode.link)}`;
        let downloadData;
        let downloadRetries = 3;

        while (downloadRetries > 0) {
          try {
            const downloadResponse = await axios.get(downloadUrl, { timeout: 10000 });
            downloadData = downloadResponse.data;
            console.log("Download Links API Response:", JSON.stringify(downloadData, null, 2));
            if (!downloadData.status || !downloadData.result?.data) {
              throw new Error("Invalid API response: Missing status or data");
            }
            break;
          } catch (error) {
            console.error(`Download Links API Error: ${error.message}, Retries left: ${downloadRetries}`);
            downloadRetries--;
            if (downloadRetries === 0) {
              await conn.sendMessage(from, {
                text: manjuTheme.box("Vault Warning", 
                  `📺 Failed to fetch download links: ${error.message}\n📺 Please try another episode`),
                ...manjuTheme.getForwardProps()
              }, { quoted: message });
              return;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        const downloadLinks = downloadData.result.data.map((link, index) => ({
          number: index + 1,
          quality: link.quality || "Unknown Quality",
          size: link.size || "Unknown Size",
          url: link.link
        }));

        if (downloadLinks.length === 0) {
          await conn.sendMessage(from, {
            text: manjuTheme.box("Vault Warning", 
              "📺 No download links available\n📺 Please try another episode"),
            ...manjuTheme.getForwardProps()
          }, { quoted: message });
          return;
        }

        let downloadOptions = `${manjuTheme.resultEmojis[1]} *${series.title} - ${selectedEpisode.title || `Episode ${selectedEpisodeNumber}`}*\n\n`;
        downloadOptions += `${manjuTheme.resultEmojis[4]} *Choose Quality*:\n\n`;
        downloadLinks.forEach(link => {
          downloadOptions += `${manjuTheme.resultEmojis[0]} ${link.number}. *${link.quality}* (${link.size})\n`;
        });
        downloadOptions += `\n${manjuTheme.resultEmojis[8]} Select quality: Reply with the number\n`;
        downloadOptions += `${manjuTheme.resultEmojis[9]} Reply 'done' to stop\n`;

        const downloadMessage = await conn.sendMessage(from, {
          text: manjuTheme.box("Download Options", downloadOptions),
          ...manjuTheme.getForwardProps()
        }, { quoted: message });

        // Store download options in Map
        selectionMap.set(downloadMessage.key.id, { series, episode: selectedEpisode, downloadLinks });
      }
      // Quality selection
      else if (selectionMap.has(repliedToId) && selectionMap.get(repliedToId).downloadLinks) {
        const { series, episode, downloadLinks } = selectionMap.get(repliedToId);
        const selectedQualityNumber = parseInt(replyText);
        const selectedLink = downloadLinks.find(link => link.number === selectedQualityNumber);

        if (!selectedLink) {
          await conn.sendMessage(from, {
            text: manjuTheme.box("Vault Warning", 
              "📺 Invalid quality selection!\n📺 Choose a quality number"),
            ...manjuTheme.getForwardProps()
          }, { quoted: message });
          return;
        }

        // Fetch direct download link
        const directDownloadUrl = `https://xham.vercel.app/api/cinesubz/download?url=${encodeURIComponent(selectedLink.url)}`;
        let directLink;
        let directRetries = 3;

        while (directRetries > 0) {
          try {
            const directResponse = await axios.get(directDownloadUrl, { timeout: 10000 });
            directLink = directResponse.data.result?.direct_link;
            console.log("Direct Download API Response:", JSON.stringify(directResponse.data, null, 2));
            if (!directLink) {
              throw new Error("No direct download link found");
            }
            break;
          } catch (error) {
            console.error(`Direct Download API Error: ${error.message}, Retries left: ${directRetries}`);
            directRetries--;
            if (directRetries === 0) {
              await conn.sendMessage(from, {
                text: manjuTheme.box("Vault Warning", 
                  `📺 Failed to fetch direct download link: ${error.message}\n📺 Try again or select another quality`),
                ...manjuTheme.getForwardProps()
              }, { quoted: message });
              return;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        // Check file size
        const sizeStr = selectedLink.size.toLowerCase();
        let sizeInGB = 0;
        if (sizeStr.includes("gb")) {
          sizeInGB = parseFloat(sizeStr.replace("gb", "").trim());
        } else if (sizeStr.includes("mb")) {
          sizeInGB = parseFloat(sizeStr.replace("mb", "").trim()) / 1024;
        }

        if (sizeInGB > 2) {
          await conn.sendMessage(from, {
            text: manjuTheme.box("Vault Warning", 
              `📺 Item too large (${selectedLink.size})!\n📺 Direct download: ${directLink}\n📺 Try a smaller quality`),
            ...manjuTheme.getForwardProps()
          }, { quoted: message });
          return;
        }

        // Send episode as document
        try {
          await conn.sendMessage(from, {
            document: { url: directLink },
            mimetype: "video/mp4",
            fileName: `${series.title} - ${episode.title || `Episode ${episodes.indexOf(episode) + 1}`} - ${selectedLink.quality}.mp4`,
            caption: manjuTheme.box("Episode Downloaded", 
              `${manjuTheme.resultEmojis[1]} *${series.title}*\n${manjuTheme.resultEmojis[2]} Episode: ${episode.title || `Episode ${episodes.indexOf(episode) + 1}`}\n${manjuTheme.resultEmojis[3]} Quality: ${selectedLink.quality}\n${manjuTheme.resultEmojis[4]} Size: ${selectedLink.size}\n\n${manjuTheme.resultEmojis[8]} Eᴘɪsᴏᴅᴇ Dᴏᴡɴʟᴏᴀᴅᴇᴅ Bʏ Mᴀɴᴊᴜ_ᴍᴅ`),
            ...manjuTheme.getForwardProps()
          }, { quoted: message });

          await conn.sendMessage(from, { react: { text: manjuTheme.resultEmojis[0], key: message.key } });
        } catch (downloadError) {
          await conn.sendMessage(from, {
            text: manjuTheme.box("Vault Warning", 
              `📺 Download error: ${downloadError.message}\n📺 Direct download: ${directLink}\n📺 Try again`),
            ...manjuTheme.getForwardProps()
          }, { quoted: message });
        }
      }
    };

    // Register the persistent selection listener
    conn.ev.on("messages.upsert", selectionHandler);

  } catch (e) {
    console.error("Error:", e);
    await conn.sendMessage(from, {
      text: manjuTheme.box("Vault Error", 
        `📺 Error: ${e.message || "Series Vault access denied"}\n📺 Vault closed\n📺 Try again later`),
      ...manjuTheme.getForwardProps()
    }, { quoted: mek });
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
  }
});
