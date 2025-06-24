const axios = require('axios');
const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, fetchApi} = require('../lib/functions')
var os = require('os');
const fs = require("fs-extra");

const seedr = require("../lib/seedr");
const torrentApi = "https://seedr-new.vercel.app"
const email = "nadeenpoorna7@gmail.com"; // seedr.cc ake acc akak hadala email aka dahan metenna
const pass = "Nadeen@1234"; // seedr.cc ake acc akak hadala passward aka dahan metenna

const { storenumrepdata } = require('../lib/nonbutton')
function formatNumber(num) {
    return String(num).padStart(2, '0');
} 

//===============================================================================
var url = "Give me movie name ?"
var valid_url = "This Url Type is Invalid"
var not_sudo = 'ඔබ yts.mx packege එක ලබා ගෙන නොමැත.🚫									   					  	                               💸 please contact us and purchase the movie download facility                                                                                                              🪀Contact Owner : https://wa.me/+94711451319?text='
var not_fo = 'I can\'t find anyting'
var giveme = "Please give me movie or tv show name"
var err = "Error !!"

const apilink = "https://www.dark-yasiya-api.site"

cmd({
    pattern: "ytsmx",
    alias: ["mv4","yts"],
    react: "🎥",
    desc: "Download movie for yts.mx",
    category: "movie",
    use: '.ytsmx < Movie Name >',
    filename: __filename
},
async(conn, mek, m,{from, l, prefix, quoted, body, isCmd, command, args, q, sender, isDev, senderNumber, isPreUser, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
const sudoNumber = config.SUDO;
	
	const isSudo = sudoNumber
      .map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
      .includes(sender)
	
  if(!isSudo) return reply(not_sudo)
  
if(!q) return await reply(giveme)
	
const movs = await fetchApi(`${apilink}/movie/ytsmx/search?text=${q}`)
var ty = ''
let mov = movs.result.data
let numrep = []


		
if (movs.result.data.length < 1) return await reply(not_fo)

		
let cot = `🔮 *𝖬𝖮𝖵𝖨𝖤 𝖲𝖤𝖠𝖱𝖢𝖧 𝖲𝖸𝖲𝖳𝖤𝖬* 🔮


`
	

                  for (let j = 0 ; j < mov.length; j++) {
                    
                  cot += `*${formatNumber( j + 1)} ||* ${mov[j].title_long}\n`
                  numrep.push(`${prefix}ytsmvjid ${mov[j].id}` )
                  }	      
  
	

	 const mass = await conn.sendMessage(from, { text: `${cot}\n\n${config.FOOTER}` }, { quoted: mek });
	
          const jsonmsg = {
            key : mass.key,
            numrep,
            method : 'nondecimal'
           }

await storenumrepdata(jsonmsg) 	
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(e)
}
})


cmd({
    pattern: "ytsmvjid",
    react: "📽️",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
const sudoNumber = config.SUDO;
	
	const isSudo = sudoNumber
      .map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
      .includes(sender)
	
  if(!isSudo) return reply(not_sudo)
  
if(!q) return await reply(url)

const anu = await fetchApi(`${apilink}/movie/ytsmx/movie?id=${q}`)
let mov = anu.result
    
    
let cot = `🎬 *𝖬𝖮𝖵𝖨𝖤 𝖣𝖮𝖶𝖭𝖫𝖮𝖠𝖣 𝖲𝖸𝖲𝖳𝖤𝖬* 🎬


   🎞️ Ttile: ${mov.title}
   📅 Year: ${mov.year}
   ⏱ Duration: ${mov.runtime}
   🖇️ Url: ${mov.url}

▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃


*${formatNumber(1)} ||* SEND INBOX
`
  
  let numrep = []
	
	numrep.push(`${prefix}ytsmvgo ${q}🎈${from}`)  

                 

for (let j = 0 ; j < config.JIDS.length; j++) {
     for (let i of config.JIDS[j].split(",") ){
                  cot += `*${formatNumber( j + 2)} ||* SEND JID: *${i}*\n`
				
                  numrep.push(`${prefix}ytsmvgo ${q}🎈${i}` )
                
     }}
  
 const mass = await conn.sendMessage(from, { text: `${cot}\n\n${config.FOOTER}`,
					    
					    contextInfo: {
          externalAdReply: { 
					title: mov.title,
					body: config.BODY,
					mediaType: 1,
					sourceUrl: mov.url,
          thumbnailUrl: mov.large_cover_image ,
	 				renderLargerThumbnail: false
         }} }, { quoted: mek });
	
          const jsonmsg = {
            key : mass.key,
            numrep,
            method : 'nondecimal'
           }

await storenumrepdata(jsonmsg) 	 
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(e)
}
})


cmd({
    pattern: "ytsmvgo",
    react: "📽️",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
const sudoNumber = config.SUDO;
	
	const isSudo = sudoNumber
      .map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
      .includes(sender)
	
  if(!isSudo) return reply(not_sudo)
  
	
	                        var inp = ''
				var jidx = ''	                
				var text = q
				if (q.includes('🎈')) jidx = text.split('🎈')[1]
				if (text.includes('🎈')) { inp = text.split('🎈')[0]}    
	

if(!inp) return await reply(err)
  
const move = await fetchApi(`${apilink}/movie/ytsmx/movie?id=${inp}`)
let mov = move.result
	
let cot = `🎬 *𝖬𝖮𝖵𝖨𝖤 𝖣𝖮𝖶𝖭𝖫𝖮𝖠𝖣 𝖲𝖸𝖲𝖳𝖤𝖬* 🎬


  🎞️ Title : ${mov.title}
  
  📅 Year : ${mov.year} 
  
  🌟 Rating : ${mov.rating}
  
  ⏱ Duration : ${mov.runtime}  
  
  🖇️ Url : ${mov.url}   
  
  🎀 Genres : ${mov.genres}
  
  🔠 Language : ${mov.language}

▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃

*${formatNumber(1)} ||* Details Card

`
  
let numrep = []
numrep.push(`${prefix}ytsmvdet ${q}`) 
	
	

		  mov.torrents.forEach((movie, index) => {
				
                  cot += `*${formatNumber( index + 2 )} ||* ${movie.quality} ( ${movie.size} )\n`
				
                  numrep.push(`${prefix}ytsdl ${movie.url}🎈${mov.title_long}🎈${movie.quality}🎈${movie.size}🎈${jidx}🎈${mov.large_cover_image}` )
                  })
                 

 const mass = await conn.sendMessage(from, { image: { url: mov.large_cover_image || mov.background_image || mov.background_image_original || '' }, caption: `${cot}\n\n${config.FOOTER}` }, { quoted: mek });
	
          const jsonmsg = {
            key : mass.key,
            numrep,
            method : 'nondecimal'
           }

await storenumrepdata(jsonmsg) 
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(e)
}
})


cmd({
    pattern: "ytsdl",
    react: "⬆",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, msr, creator, backup, isGroup, apilink2, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
const sudoNumber = config.SUDO;
	
	const isSudo = sudoNumber
      .map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
      .includes(sender)
	
  if(!isSudo) return reply(not_sudo)
	
	
if (!q) return reply("❗ *Please give me valid link*")	
	
                                var typ = ''
				var jidx = ''
				var inp = ''
				var nmf = ''
				var size = ''
			  var quality = ''
	      var img_s = ''
				var text = q
				if (q.includes('🎈')) nmf = text.split('🎈')[1]
				if (text.includes('🎈')) { inp = text.split('🎈')[0]
              quality =  text.split('🎈')[2]
							size =  text.split('🎈')[3]
							jidx =  text.split('🎈')[4]
							img_s =  text.split('🎈')[5]}



if(!inp) return await reply(err)
const anu = await fetchJson(`${torrentApi}/seedr/direct?torrent=${inp}&email=${email}&pass=${pass}`)

const up_mg = await conn.sendMessage(from, { text : 'Uploading Your Request Video..⬆' }, {quoted: mek})
const jid = jidx || from
	
const mvdoc = await conn.sendMessage( jid , { 
		document : { url : anu.files[0].url } , 
		fileName: `${nmf}.mp4`  , 
		mimetype: 'video/mp4', 
		caption: nmf + `\n(${quality})


` + config.CAPTION
	})		


await fetchJson(`${torrentApi}/seedr/clear?email=${email}&pass=${pass}`)
await conn.sendMessage(from, { delete: up_mg.key })

if (jidx === from) { 
await conn.sendMessage(from, { react: { text: '✔', key: mek.key } }) 
await sleep(500 * 1) }	

else {
await conn.sendMessage(from, { text : 'File Send Succesfull ✔' }, { quoted: mek }) 
await conn.sendMessage(from, { react: { text: '✔', key: mek.key } })	
await sleep(500 * 1) }

} catch (e) {
await fetchJson(`${torrentApi}/seedr/clear?email=${email}&pass=${pass}`)
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(e)
}
})

cmd({
    pattern: "ytsmvdet",
    react: "📽️",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, prefix, isCmd, backup, command, args, q, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, isBotAdmins, isCreator ,isDev, reply}) => {
try{
const sudoNumber = config.SUDO;
	
	const isSudo = sudoNumber
      .map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
      .includes(sender)
	
  if(!isSudo) return reply(not_sudo)
  
if(!q) return await reply(url)

  
	var inp = ''
				var jidx = ''	                
				var text = q
				if (q.includes('🎈')) jidx = text.split('🎈')[1]
				if (text.includes('🎈')) { inp = text.split('🎈')[0]}   


const anu = await fetchApi(`${apilink}/movie/ytsmx/movie?id=${inp}`)
let mov = anu.result	

const name = mov.title
const title_long = mov.title_long
const date = mov.year
const runtime = mov.runtime + " second"
const rating = mov.rating
const genres = mov.genres
const desc = mov.description_intro
const likes = mov.like_count || "N/A"
	
let yt = `
🍟 _*${name}*_


🧿 Release Year: ➜ ${date}

⏱️ Duration: ➜ ${runtime}

🎀 Categories: ➜ ${genres}

⭐ Rating: ➜ ${rating}

👍 Likes: ➜ ${likes}


`

	
const jid = jidx || from

	
await conn.sendMessage(jid ,  { image : { url : mov.large_cover_image || mov.background_image || mov.background_image_original || '' } , caption : yt + `${config.CAPTION}` })
await conn.sendMessage(backup ,  { image : { url : mov.large_cover_image || mov.background_image || mov.background_image_original || '' } , caption : yt + `${config.CAPTION}` })

if (jidx === from) { 
await conn.sendMessage(from, { react: { text: '✔', key: mek.key } }) 
//await sleep(1000 * 1) 
}	

else {
await conn.sendMessage(from, { text : 'Details Card Sended ✔' }, { quoted: mek }) 
await conn.sendMessage(from, { react: { text: '✔', key: mek.key } })	
//await sleep(1000 * 1) 
}
	
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(e)
}
})
