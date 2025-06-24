const axios = require('axios');
const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, fetchApi} = require('../lib/functions')
const cinesubz = require('../lib/cinesubz')
const { storenumrepdata } = require('../lib/nonbutton')
function formatNumber(num) {
    return String(num).padStart(2, '0');
} 


//===============================================================================
var url = "Give me movie name ?"
var valid_url = "This Url Type is Invalid"
var not_sudo = 'Your not premier user 🚫									   					  	                 💸 please contact us and purchase the movie download facility                                                                                                              🌠Contact Owner : 0711451319'
var not_fo = 'I can\'t find anyting'
var giveme = "Please give me movie or tv show name"


const apilink = "https://www.dark-yasiya-api.site"
const apilink2 = "https://www.dark-yasiya-api.site"
const apikey = "yasiyalk"

cmd({
    pattern: "mv",
    alias: ["mvall","search"],
    react: "🎥",
    desc: "Download movie for cinesubz.co, sinhalasub.lk",
    category: "movie",
    use: '.mv < Movie Name >',
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
	
if (!q) return await reply(giveme)
	
const movs = await fetchApi(`${apilink}/private/sit1/sc1?text=${q}&apikey=${apikey}`)
var ty2 = ''
let cine = movs.result.data
	
const movs2 = await fetchApi(`${apilink2}/movie/sinhalasub/search?text=${q}`)
var ty = ''
let sinh = movs2.result.data
	
	
let numrep = []
var s_t_1 = ''
var s_t_2 = ''		
const startIndex = cine.length + 1; 	             
		
		

    
 		  cine.forEach((movie, index) => {
				
		  if(movie.type == 'TV' ) ty2 = 'citvjid '
                  if(movie.type == 'Movie' ) ty2 = 'cimvjid ' 
				
                  s_t_1 += ` *${formatNumber( index + 1 )} ||* ${movie.title.replace(/Sinhala Subtitles \| සිංහල උපසිරැසි සමඟ/g , '').replace('Sinhala Subtitle | සිංහල උපසිරැසි සමඟ' , '')} | ${movie.type}\n`
				
                  numrep.push(`${prefix}${ty2} ${movie.link}` )
                  })
		
		
		 sinh.forEach((movie, index) => {
				
		  if(movie.type == 'TV' ) ty = 'sitvjid '
                  if(movie.type == 'Movie' ) ty = 'simvjid ' 
				
                  s_t_2 += ` *${formatNumber( startIndex + index )} ||* ${movie.title.replace(/Sinhala Subtitles \| සිංහල උපසිරසි සමඟ/g , '').replace('Sinhala Subtitle | සිංහල උපසිරසි සමඟ' , '')} | ${movie.type}\n`
				
                  numrep.push(`${prefix}${ty} ${movie.link}` )
                  })	
		

		
if(!s_t_1 && !s_t_2) { return await reply(not_fo) }
		

		
              let cot = `🔮 *𝖬𝖮𝖵𝖨𝖤-DL-X 𝖲𝖤𝖠𝖱𝖢𝖧 𝖲𝖸𝖲𝖳𝖤𝖬* 🔮
              

${s_t_1 ? '*Cinesubz.co*\n' + s_t_1 + ( s_t_2 ?  '\n*Sinhalasub.lk*\n' +  s_t_2  : '') : ( s_t_2 ?  '*Sinhalasub.lk*\n' +  s_t_2  : '')}
`
	



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
