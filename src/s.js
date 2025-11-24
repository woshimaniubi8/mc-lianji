//文件:s.js
//描述:前端逻辑
//时间:2025-11-01
//作者:wohenaighs@163.com

// 这怎么一半敖丙一半哪吒呀😱这敖丙混起来是怎么回事啊出去出去😡不要了不要了😱😱😱不要了😭不要我要[发怒]
// 你要他干啥呀[发怒]反正我是不要[发怒]快看[憨笑]我命由我不由天🤬这是谁说的[发怒]所以啊[憨笑]才不要敖丙进来呢[发怒]
// 爱[憨笑]这个放到我这不刚刚好吗[憨笑]正好我的敖丙缺了一半[憨笑]就算你拼上了敖丙也特别的丑[发怒]倒是好玩啊[愉快]你看

const version_code = '1.0.4'
const clients = 0 //1: electron  0: 浏览器
const LOCAL_TEST = 0

const mdui_theme = {
  1: ['light', 'light_mode', '浅色主题'],
  2: ['dark', 'dark_mode', '深色主题'],
  3: ['auto', 'brightness_auto', '主题跟随系统'],
}
const gameMode = {
  Survival: ['shengcun', '生存'],
  Adventure: ['maoxian', '冒险'],
  Creative: ['chuangzao', '创造'],
  Spectator: ['pangguan', '旁观'],
}
let allRoomList = [] // 所有房间数据
let filteredRoomList = []
const loadingScreen = document.getElementById('dialog-loading')
let activeAccount = localStorage.getItem('ac_id') || -1
let userID
if (localStorage.getItem('user_id') != 'null') {
  userID = localStorage.getItem('user_id') || '未设置id'
} else {
  userID = '未设置id'
}
let hideInvalidroom = localStorage.getItem('hide_invalid_room') === 'true' ? true : false
let hideOtherroom = localStorage.getItem('hide_other_room') === 'true' ? true : false
let decodeColorstring = localStorage.getItem('decode_color_string') === 'true' ? true : false
let enableOldUI = localStorage.getItem('enable_old_ui') === 'false' ? false : true
let enableTwoFr = localStorage.getItem('enable_TwoFr') === 'true' ? true : false
let first_go = localStorage.getItem('is_first_times') === null ? true : false
let LDtheme = localStorage.getItem('themes') || 1
LDtheme = Number(LDtheme)
let xuid = localStorage.getItem('user_xuid') || ''
let user_avatar = localStorage.getItem('user_avatar') || ''
let enbaleVconsole = localStorage.getItem('enable_vconsole') === 'true' ? true : false
let headimg = ''
let newerMarkdown
let accountInfo = []
let roomList = []
let currentSortMethod = localStorage.getItem('sort') || 'time' // 默认排序方式为时间
let languageCode = [] //src/fasttext-language-code.json
const nowDate = new Date()
const lastOpenDate = new Date(localStorage.getItem('last_open_date'))

if (localStorage.getItem('last_open_date')) {
  const diffs = nowDate - lastOpenDate
  if (diffs >= 604800000) {
    console.log(diffs)
    const years = Math.floor(diffs / 31536000000)
    const months = Math.floor((diffs % 31536000000) / 2628000000)
    const days = Math.floor((diffs % 2628000000) / 86400000)
    const hours = Math.floor((diffs % 86400000) / 3600000)
    const minutes = Math.floor((diffs % 3600000) / 60000)
    const seconds = Math.floor((diffs % 60000) / 1000)

    const year = years >= 1 ? years + '年' : ''
    const month = months >= 1 ? months + '月' : ''
    const day = days >= 1 ? days + '天' : ''
    const hour = hours >= 1 ? hours + '小时' : ''
    const minute = minutes >= 1 ? minutes + '分钟' : ''
    const sec = seconds + '秒'

    mdui.dialog({
      headline: '欢迎回来!',
      description: `您已经${year}${month}${day}${hour}${minute}${sec}没来过了 记得常回来看看!`,
      actions: [
        {
          text: '好的',
          onClick: () => {
            return true
          },
        },
      ],
    })
  }
}
localStorage.setItem('last_open_date', new Date())
document.getElementById('sort-list').value = currentSortMethod
const roomListElement = document.querySelector(`.room-list`)
roomListElement.className = `room-list${enableTwoFr ? ' TwoFr' : ''}`
document.getElementById('enable_vconsole').checked = enbaleVconsole
function escapeHtml(unsafe) {
  if (!unsafe) return ''
  return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

// 审核员：这个我封了。
// 作者：别呀！
// 审核员：必须得封！
// 唔…（作者强吻了审核员）
// 作者：还封不封？
// （审核员轻笑一声，把作者抗走）
// 审核员：乖😏…
// 后面自行脑补。

//解析房间标题的颜色字符
function formatMinecraftText(str) {
  if (!str) return ''
  if (!decodeColorstring) return str

  // 颜色映射
  const colors = {
    0: '#000000', // black
    1: '#0000AA', // dark_blue
    2: '#00AA00', // dark_green
    3: '#00AAAA', // dark_aqua
    4: '#AA0000', // dark_red
    5: '#AA00AA', // dark_purple
    6: '#FFAA00', // gold
    7: '#AAAAAA', // gray
    8: '#555555', // dark_gray
    9: '#5555FF', // blue
    a: '#55FF55', // green
    b: '#55FFFF', // aqua
    c: '#FF5555', // red
    d: '#FF55FF', // light_purple
    e: '#FFFF55', // yellow
    f: '#FFFFFF', // white
    g: '#DDD605', // minecoin_gold
    h: '#E3D4D1', // material_quartz
    i: '#CECACA', // material_iron
    j: '#443A3B', // material_netherite
    m: '#971607', // material_redstone
    n: '#B4684D', // material_copper
    p: '#DEB12D', // material_gold
    q: '#47A036', // material_emerald
    s: '#2CBAA8', // material_diamond
    t: '#21497B', // material_lapis
    u: '#9A5CC6', // material_amethyst
    v: '#EB7114', // material_resin
  }

  let result = ''
  let buffer = ''
  let currentStyles = {
    color: '',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  }

  function flushBuffer() {
    if (!buffer) return

    let style = ''
    let classes = []

    if (currentStyles.color) {
      style += `color:${currentStyles.color};`
    }
    if (currentStyles.bold) {
      classes.push('mc-bold')
    }
    if (currentStyles.italic) {
      classes.push('mc-italic')
    }
    if (currentStyles.underline) {
      classes.push('mc-underline')
    }
    if (currentStyles.strikethrough) {
      classes.push('mc-strikethrough')
    }

    const classAttr = classes.length ? `class="${classes.join(' ')}"` : ''
    const styleAttr = style ? `style="${style}"` : ''

    if (styleAttr || classAttr) {
      result += `<span ${styleAttr} ${classAttr}>${escapeHtml(buffer)}</span>`
    } else {
      result += escapeHtml(buffer)
    }

    buffer = ''
  }

  for (let i = 0; i < str.length; i++) {
    const char = str[i]

    if (char === '§' && i + 1 < str.length) {
      const codeChar = str[i + 1].toLowerCase()
      i++ // 跳过代码字符

      flushBuffer() // 处理之前的文本

      switch (codeChar) {
        case 'r': // 重置
          currentStyles = {
            color: '',
            bold: false,
            italic: false,
            underline: false,
            strikethrough: false,
          }
          break

        case 'l': // 粗体
          currentStyles.bold = true
          break

        case 'o': // 斜体
          currentStyles.italic = true
          break

        case 'n': // 下划线
          currentStyles.underline = true
          break

        case 'm': // 删除线
          currentStyles.strikethrough = true
          break

        case 'k':
          result += '<span class="mc-obfuscated">'
          let obfuscatedText = ''
          while (i + 1 < str.length && str[i + 1] !== '§') {
            obfuscatedText += str[++i]
          }
          result += escapeHtml(obfuscatedText) + '</span>'
          break
        default: // 颜色代码
          if (colors[codeChar]) {
            currentStyles.color = colors[codeChar]
          }
          break
      }
    } else {
      buffer += char
    }
  }

  flushBuffer() // 处理最后一段文本
  return result
}

// 新增：排序函数
function sortRooms(rooms) {
  let roomsToSort = [...rooms]
  const stripColorCodes = (str) => (str ? str.replace(/§./g, '') : '')

  switch (currentSortMethod) {
    case 'time':
      // 最新创建的在前
      roomsToSort.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      break
    case 'name':
      // 按房间名称字母顺序 (A-Z)
      roomsToSort.sort((a, b) => stripColorCodes(a.name).localeCompare(stripColorCodes(b.name)))
      break
    case 'host':
      // 按房主名称字母顺序 (A-Z)
      roomsToSort.sort((a, b) => a.host.localeCompare(b.host))
      break
    case 'none':
    default:
      // 不排序，保持API返回或搜索后的顺序
      break
  }
  return roomsToSort
}

async function fetchAccount() {
  try {
    const res = await fetch('https://api.miaaoo.com/account')
    const ac = await res.json()
    accountInfo = []
    ac.forEach((acs) => {
      accountInfo.push({
        id: acs.id,
        name: acs.name,
        isadd: acs.canaddfriends,
      })
    })
    if (activeAccount === -1) {
      activeAccount = accountInfo[0].id
      localStorage.setItem('ac_id', activeAccount)
    }
  } catch (error) {
    console.error('Fetch dick failed: ', error)
    toastrs.error(error, '获取账号列表失败')
  }
}
async function joinroom(addid, roomfrom, roomid, sessionid, xuids) {
  //{
  // "version": "1.0.0",
  // //现在版本只有1.0.0
  // "joininformation": {
  //   "addid": "6",
  //   // 你添加了哪位好友就填对应好友的id数字
  //   // 详情查看/account请求
  //   "roomfrom": "6",
  //   // 房间来源的好友id 在/list请求中roomfrom对应的值
  //   "roomid": "00000000-0000-0000-0000-000000000000",
  //   // 在/list请求中id对应的值
  //   "sessionname": "00000000-0000-0000-0000-000000000000"
  //   // 在/list请求中sessionRef中的name对应的值
  // },
  // "invitecontrol": {
  //   "userxuid": "000000000000000",
  //   // 你的xuid,可以用/getxuid获取
  // }
  loadingScreen.open = true
  const body = {
    version: '1.0.0',
    joininformation: {
      addid: addid,
      roomfrom: roomfrom,
      roomid: roomid,
      sessionname: sessionid,
    },
    invitecontrol: {
      userxuid: xuids,
    },
  }
  //console.log(JSON.stringify(body))
  try {
    let res_data
    if (!LOCAL_TEST) {
      const res = await fetch('https://api.miaaoo.com/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        throw new Error(`Join error! status: ${res.status}`)
      }
      res_data = await res.json()
    } else {
      res_data = { code: '1', message_zh_CN: '使用本地数据测试，默认成功' }
    }
    loadingScreen.open = false
    if (res_data.code === '1') {
      toastrs.warning(res_data.message_zh_CN, '加入成功')
    } else {
      toastrs.success(res_data.message_zh_CN, '加入成功')
    }
    loadingScreen.open = false
  } catch (error) {
    console.error('join failed :', error)
    toastrs.error(error, '广播房间失败')
    loadingScreen.open = false
  }
}

async function fetchPlayerInfo(playerID, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`https://api.miaaoo.com/profile?gt=${playerID}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) {
        if (res.status === 429) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
          continue
        }
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      return {
        xuid: data.profileUsers[0].id,
        // hostId: data.profileUsers[0].hostId,
        displayPicRaw: data.profileUsers[0].settings.find((setting) => setting.id === 'GameDisplayPicRaw').value,
        gamertag: data.profileUsers[0].settings.find((setting) => setting.id === 'Gamertag').value,
        displayName: data.profileUsers[0].settings.find((setting) => setting.id === 'GameDisplayName').value,
      }
    } catch (error) {
      console.error(`Error fetching player info (attempt ${i + 1}/${retries}):`, error)
      toastrs.error(error, '获取玩家信息失败')
      loadingScreen.open = false
    }
  }
}

async function fetchRoomlist() {
  //Example room data:
  // {
  //   "sessionRef": {
  //     "name": "5722A48C-F038-4060-939F-D93F2FD99090"
  //   },
  //   "createTime": "2025-08-11T02:59:27.0911143Z",
  //   "id": "bde5b4c5-e26c-467d-9998-229f0c15c1f2",
  //   "customProperties": {
  //     "hostName": "NyaCrasin",
  //     "ownerId": "2535446053481762",
  //     "version": "1.21.100",
  //     "worldName": "宁晨社区[无限资源][PVP][PVE][小游戏]",
  //     "worldType": "Adventure",
  //     "MemberCount": 13,
  //     "MaxMemberCount": 16,
  //     "BroadcastSetting": 3,
  //     "isHardcore": false
  //   },
  //   "roomfrom": "2"
  // },
  try {
    let data
    if (!LOCAL_TEST) {
      const res = await fetch('https://api.miaaoo.com/list')
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      data = await res.json()
    } else {
      data = {
        results: [
          {
            sessionRef: {
              name: '5722A48C-F038-4060-939F-D93F2FD91090',
            },
            createTime: '2025-08-11T02:59:27.0911143Z',
            id: 'bde5b4c5-e26c-467d-9998-229f0c15c1f1',
            customProperties: {
              hostName: 'NyaCrasin',
              ownerId: '2535446053481762',
              version: '1.21.100',
              worldName: '宁晨社区[无限资源][PVP][PVE][小游戏]',
              worldType: 'Adventure',
              MemberCount: 13,
              MaxMemberCount: 16,
              BroadcastSetting: 3,
              isHardcore: false,
            },
            roomfrom: '2',
          },
          {
            sessionRef: {
              name: '5722A48C-F038-4060-939F-D93F2FD92090',
            },
            createTime: '2025-08-11T02:59:27.0911143Z',
            id: 'bde5b4c5-e26c-467d-9998-229f0c15c1f2',
            customProperties: {
              hostName: 'Gouuu',
              ownerId: '2535446053481762',
              version: '1.21.101',
              worldName: '§a我§e的§c是§k解',
              worldType: 'Survival',
              MemberCount: 13,
              MaxMemberCount: 16,
              BroadcastSetting: 3,
              isHardcore: false,
            },
            roomfrom: '2',
          },
          {
            sessionRef: {
              name: '5722A48C-F038-4060-939F-D93F2FD93090',
            },
            createTime: '2025-08-11T02:59:27.0911143Z',
            id: 'bde5b4c5-e26c-467d-9998-229f0c15c1f3',
            customProperties: {
              hostName: 'Gaobiaoshun',
              ownerId: '2535446053481762',
              version: '1.19.81',
              worldName: '大树の秘密',
              worldType: 'Creative',
              MemberCount: 16,
              MaxMemberCount: 16,
              BroadcastSetting: 3,
              isHardcore: false,
            },
            roomfrom: '6',
          },
          {
            sessionRef: {
              name: '5722A48C-F038-4060-939F-D93F2FD94090',
            },
            createTime: '2025-08-11T02:59:27.0911143Z',
            id: 'bde5b4c5-e26c-467d-9998-229f0c15c1f4',
            customProperties: {
              hostName: 'RiverBacker11',
              ownerId: '2535446053481762',
              version: '1.21.101',
              worldName: '丧尸来了，快建房！（房主有神器）',
              worldType: 'Creative',
              MemberCount: 12,
              MaxMemberCount: 31,
              BroadcastSetting: 3,
              isHardcore: true,
            },
            roomfrom: '3',
          },
        ],
      }
      toastr.warning('注意：当前房间数据为本地测试数据，部署前请关闭LOCAL_TEST')
    }
    // console.log('Room list fetched successfully:')

    allroomList = []
    roomList
    data.results.forEach((room) => {
      allRoomList.push({
        sessionName: room.sessionRef.name,
        createTime: room.createTime,
        id: room.id,
        xuid: room.customProperties.ownerId,
        name: room.customProperties.worldName,
        host: room.customProperties.hostName,
        version: room.customProperties.version,
        type: room.customProperties.worldType,
        memberCount: room.customProperties.MemberCount,
        maxMemberCount: room.customProperties.MaxMemberCount,
        isHardcore: room.customProperties.isHardcore,
        broadcastSetting: room.customProperties.BroadcastSetting,
        worldNameLang: room.customProperties.worldNameLang,
        roomFrom: room.roomfrom,
      })
      // console.log('Room: ' + JSON.stringify(room))
      filteredRoomList = [...allRoomList]
      return allRoomList
    })
  } catch (error) {
    console.error('Error fetching room list:', error)
    toastrs.error(error, '获取房间列表失败')
    return []
  }
}

async function fetchRoomInfo(sessionName, roomFrom) {
  const url = `https://api.miaaoo.com/roominfo?session=${sessionName}&roomfrom=${roomFrom}`
  try {
    let data
    if (!LOCAL_TEST) {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      data = await res.json()
    } else {
      // Create mock data for local testing
      data = {
        properties: {
          custom: {
            hostName: 'Madefake114514',
            version: '1.21.113',
            worldType: 'Survival',
            isHardcore: false,
          },
        },
        members: {
          0: { gamertag: 'Madefake114514', constants: { system: { xuid: '2535446053481762' } } },
          1: { gamertag: 'Gouza ya', constants: { system: { xuid: '2535446053481762' } } },
          2: { gamertag: 'HeeloMC25b', constants: { system: { xuid: '2535446053481762' } } },
        },
      }
      toastr.info('使用本地数据.')
    }

    return data
  } catch (error) {
    console.error(error, '获取房间信息失败')
    throw error // Re-throw to be caught by the caller
  }
}

function getTimeText(timeString) {
  const times = new Date(timeString)
  const now = new Date()
  const diff = now - times

  if (diff >= 86400000) {
    // >= 1d
    return Math.ceil(diff / 86400000) + '天前'
  }
  if (diff >= 3600000) {
    // >= 1h
    return Math.ceil(diff / 3600000) + '小时前'
  }
  if (diff >= 60000) {
    // >= 1min
    return Math.ceil(diff / 60000) + '分钟前'
  }
  if (diff >= 1000) {
    // >= 1s
    return Math.ceil(diff / 1000) + '秒前'
  }
  if (diff >= 0) {
    // >= 0ms
    return diff + '毫秒前'
  }
  // console.log('diff:', now - times)
}

function renderRoomInfoDialog(data) {
  const dialog = document.getElementById('dialog-room-info')
  const membersList = document.getElementById('room-info-members-list')
  const nameSpan = document.getElementById('room-info-name')
  const hostSpan = document.getElementById('room-info-host')
  const gamemodeSpan = document.getElementById('room-info-gamemode')
  const versionSpan = document.getElementById('room-info-version')
  const customProps = data.properties.custom
  const isFull = customProps.MemberCount >= customProps.MaxMemberCount
  const peopleNumClass = isFull ? 'people-num full' : 'people-num non-full'
  // Clear previous content
  membersList.innerHTML = `          <div class="info-line">
          
            <span class="${peopleNumClass}" style="margin:0 auto">${customProps.MemberCount} / ${customProps.MaxMemberCount}</span>
          </div>`
  let online_people = []
  let offline_people = []
  // Populate members
  if (data.members) {
    const memberCount = Object.keys(data.members).length
    if (memberCount === 0) {
      membersList.innerHTML = '<mdui-list-item>没有找到成员信息</mdui-list-item>'
    } else {
      Object.values(data.members).forEach((member) => {
        if (member && member.gamertag) {
          const listItem = document.createElement('mdui-list-item')

          listItem.disabled = !member.properties.system.active
          const xuid = member.constants.system.xuid
          listItem.innerHTML = `
                      <span>${member.gamertag}</span>
                      <mdui-avatar slot="icon" src="https://persona-secondary.franchise.minecraft-services.net/api/v1.0/profile/xuid/${xuid}/image/head"></mdui-avatar>

                  `
          if (!member.properties.system.active) {
            listItem.innerHTML += `<p slot="end-icon"><span>离线</span></p>`
          }
          if (member.properties.system.active) {
            online_people.push(listItem)
          } else {
            offline_people.push(listItem)
          }
        }
      })
      if (online_people) {
        online_people.forEach((l) => {
          membersList.appendChild(l)
        })
      }
      if (offline_people) {
        offline_people.forEach((l) => {
          membersList.appendChild(l)
        })
      }
    }
  }

  // Populate other info

  const verIcon = Number(customProps.version.slice(0, 4)) >= 1.2 ? './src/new_mc.png' : './src/old_mc.png'
  nameSpan.innerHTML = formatMinecraftText(customProps.worldName)
  hostSpan.innerHTML =
    `<mdui-avatar slot="icon" src="https://persona-secondary.franchise.minecraft-services.net/api/v1.0/profile/xuid/${customProps.ownerId}/image/head" style="height:18px;width:auto;vertical-align:-14%"></mdui-avatar> ${customProps.hostName}` ||
    'N/A'
  gamemodeSpan.innerHTML =
    `<img src='src/${
      (customProps.isHardcore ? 'jixian' : gameMode[customProps.worldType]?.[0]) || 'unknow'
    }.png' class="room-tag-img" style="image-rendering: pixelated;margin-left:1px;margin-right:5px;vertical-align:-11%;" loading="lazy">` +
    (customProps.isHardcore ? '极限' : gameMode[customProps.worldType]?.[1] || customProps.worldType || 'N/A')
  versionSpan.innerHTML =
    `<img src="${verIcon}"class="room-tag-img" style="image-rendering: pixelated;margin-left:2px;margin-right:5px;vertical-align:-11%;" loading="lazy"/>` + customProps.version || 'N/A'

  dialog.open = true
}

async function saveUserConfig() {
  loadingScreen.open = true
  activeAccount = document.getElementById('radio-g').value
  localStorage.setItem('ac_id', activeAccount)
  const inputs = document.getElementById('input-userid').value
  if (inputs != userID) {
    userID = inputs ? inputs : '未设置id'
    localStorage.setItem('user_id', userID === '未设置id' ? '' : userID)
    document.getElementById('span-userid').innerHTML = userID
    if (inputs && userID != '未设置id') {
      const userProfile = await fetchPlayerInfo(userID)
      //   console.log('User profile fetched:', userProfile)
      xuid = userProfile.xuid
      user_avatar = userProfile.displayPicRaw + '&width=64&height=64'
      localStorage.setItem('user_xuid', xuid)
      localStorage.setItem('user_avatar', user_avatar)
    }
    if ((userID != '未设置id' && userID != '') | (xuid != '')) {
      document.getElementById('avatar-view').src = user_avatar
    } else {
      document.getElementById('avatar-view').src = ``
    }
  }
  hideInvalidroom = document.getElementById('hide-invalid-room').checked
  hideOtherroom = document.getElementById('hide-other-room').checked
  decodeColorstring = document.getElementById('decode-color-string').checked
  enableOldUI = document.getElementById('enable-old-ui').checked
  enableTwoFr = document.getElementById('enable-TwoFr').checked
  localStorage.setItem('hide_invalid_room', hideInvalidroom)
  localStorage.setItem('hide_other_room', hideOtherroom)
  localStorage.setItem('decode_color_string', decodeColorstring)
  localStorage.setItem('enable_old_ui', enableOldUI)
  localStorage.setItem('enable_TwoFr', enableTwoFr)
  await displayRoomList(filteredRoomList) // 修改：使用 filteredRoomList 保留搜索结果
  loadingScreen.open = false
  document.getElementById('dialog-cancel').style.display = 'block'
  document.getElementById('dialog-user-settings').open = false
  toastrs.success('更新配置成功')
}
async function displayRoomList(roomsToDisplay = filteredRoomList) {
  roomListElement.className = `room-list${enableTwoFr ? ' TwoFr' : ''}`
  roomListElement.innerHTML = ''

  const sortedRooms = sortRooms(roomsToDisplay) // 在渲染前排序
  const uniqueRooms = [...new Map(sortedRooms.map((room) => [room.id, room])).values()] //房间去重
  // let secondRooms,
  //   valid_room,
  //   invalid_room = []
  // uniqueRooms.forEach((room) => {
  //   const isFull = room.memberCount >= room.maxMemberCount
  //   if (isFull) {
  //     return // 跳过满员且设置了隐藏的房间
  //   }

  //   if (room.broadcastSetting < 3) {
  //     return // 跳过不可加入且设置了隐藏的房间
  //   }
  //   secondRooms.push(room)
  // })

  if (uniqueRooms.length === 0) {
    roomListElement.innerHTML = '<p style="text-align: center; color: grey;">当前没有可显示的房间。</p>'
    return
  }

  uniqueRooms.forEach((room) => {
    // console.log(getTimeText(room.createTime))
    // console.log(room)
    if (room.roomFrom === activeAccount || !hideOtherroom) {
      const isFull = room.memberCount >= room.maxMemberCount
      if (isFull && hideInvalidroom) {
        return // 跳过满员且设置了隐藏的房间
      }

      let isDisabled = isFull
      let buttonText = isFull ? '房间已满' : '广播房间'
      let buttonIcon = isFull ? 'close' : 'login'

      if (room.broadcastSetting < 3) {
        if (hideInvalidroom) {
          return // 跳过不可加入且设置了隐藏的房间
        }
        isDisabled = true
        buttonText = '限制加入'
        buttonIcon = 'block'
      }

      const peopleNumClass = isFull ? 'people-num full' : 'people-num non-full'
      const gamemode = room.isHardcore ? ['jixian', '极限'] : gameMode[room.type] || ['unknown', '未知']
      const verIcon = Number(room.version.slice(0, 4)) >= 1.2 ? './src/new_mc.png' : './src/old_mc.png'
      const roomCard = document.createElement('mdui-card')
      // console.log(room.worldNameLang)
      const langText_1 = languageCode.find((item) => item.code === room.worldNameLang)

      // 如果找到了对象，返回它的 name_zh 属性；否则返回 null 或其他默认值
      const langText = langText_1 ? langText_1.name_zh : '未知'
      roomCard.className = 'room-card card-animate' // 使用新的 class
      roomCard.style.cursor = 'pointer'
      if (!enableOldUI) {
        roomCard.innerHTML = `
        <div class="room-card-header">
          <p id="room-name2" title="${room.name.replace(/§./g, '')}">${formatMinecraftText(room.name)}</p>
        </div>

        <div class="room-card-body">
          <div class="info-line">
            <img src="https://persona-secondary.franchise.minecraft-services.net/api/v1.0/profile/xuid/${
              room.xuid
            }/image/head" class="host-avatar" alt="Host Avatar" loading="lazy" style="image-rendering: pixelated;"/>
            <span><a href="https://www.xbox.com/play/user/${room.host}" target="_blank" title="查看 ${room.host} 的Xbox档案"><strong>${room.host}</strong></span></a>
          </div>
          <div class="info-line">
            <mdui-icon name="people"></mdui-icon>
            <span><span class="${peopleNumClass}">${room.memberCount} / ${room.maxMemberCount}</span></span>
          </div>
          <div class="info-line">
            <mdui-icon name="access_time"></mdui-icon>
            <span>${getTimeText(room.createTime)}</span>
          </div>
          <div style="display:flex" id="room-list-icongroup${enableTwoFr ? '-twofr' : ''}">
          <div class="info-line tags" style="margin-left:0px;" title="单击以搜索标签" id="btn-mode-${room.id}">
            <img src="src/${gamemode[0]}.png" class="room-tag-img" style="image-rendering: pixelated;margin-left:1px;margin-right:2px" loading="lazy"/>
            <span style="color:rgb(var(--mdui-color-on-primary))">${gamemode[1]}</span>
           </div>
            <div class="info-line tags ver" style="margin-left:0px;" title="单击以搜索标签" id="btn-version-${room.id}">
            <img src="${verIcon}"class="room-tag-img" style="image-rendering: pixelated;margin-left:2px;" loading="lazy"/>
            <span style="color:rgb(var(--mdui-color-on-primary))">${room.version}</span>
           </div>
             <div class="info-line tags ver" style="margin-left:0px;" title="单击以搜索标签" id="btn-lang-${room.id}">
            <mdui-icon name="translate" class="room-tag-img" style="font-size:16px;margin-left:2px;color:rgb(var(--mdui-color-surface-container-lowest))" ></mdui-icon>
            <span style="color:rgb(var(--mdui-color-on-primary))">${langText}</span>
           </div>
           </div>
          </div>
        </div>

        <div class="room-card-footer">
          <mdui-button class="join-button" ${isDisabled ? 'disabled' : ''} end-icon="${buttonIcon}" id="btn-joinroom-${room.id}">${buttonText}</mdui-button>
          <mdui-tooltip content="分享房间">
            <mdui-button-icon icon="share" id="btn-share-${room.sessionName}"></mdui-button-icon>
          </mdui-tooltip>
        </div>
      `
      } else {
        document.querySelector('.room-list').style = 'padding: 10px 0; display: grid ; grid-template-columns: repeat(auto-fill, minmax(35vh, 1fr)); gap: 10px; width: 98%; margin: 0 auto;'
        roomCard.className = 'room-items'
        roomCard.innerHTML = ` <p id="room-name2" title="${room.name}">${formatMinecraftText(room.name)}</p>
        <div class="room-info">
          <p id="room-host">
            <img
              src="https://persona-secondary.franchise.minecraft-services.net/api/v1.0/profile/xuid/${room.xuid}/image/head"
              width="18"
              height="18"
              class="room-icon"
              id=${room.host}
              style="vertical-align: -10%; margin-right: 6px;image-rendering: pixelated;"
              loading="lazy"
            />${room.host}
          </p>
          <p id="room-people">
            <mdui-icon name="people" class="room-icon"></mdui-icon><span class="${peopleNumClass}">${room.memberCount}/${room.maxMemberCount}</span
            ><img
              alt="GameMode"
              src="src/${gamemode[0]}.png"
              decoding="async"
              loading="lazy"
              width="18"
              height="18"
              class="room-icon"
              style="
                margin-left: 20px;
                image-rendering: pixelated;
                vertical-align: -18%;
              "
              loading="lazy"
            />${gamemode[1]}<mdui-icon name="videogame_asset" class="room-icon" style="margin-left: 20px"></mdui-icon>${room.version}
          </p>
        </div>

  <div style="display: flex; gap: 3px; margin-bottom: 10px">
    <mdui-button ${isDisabled ? 'disabled' : ''} end-icon="${buttonIcon}" id="btn-joinroom-${room.id}" style="flex: 1;">${buttonText}</mdui-button>
    <mdui-tooltip content="分享房间">
      <mdui-button-icon icon="share" id="btn-share-${room.sessionName}"></mdui-button-icon>
    </mdui-tooltip>
</div>`
      }

      roomListElement.appendChild(roomCard)

      // Add listener for room info dialog
      roomCard.addEventListener('click', async (event) => {
        // Prevent dialog from opening if a button, icon button, or link was clicked
        if (event.target.closest('mdui-button, mdui-button-icon, a')) {
          return
        }
        loadingScreen.open = true
        try {
          const roomInfo = await fetchRoomInfo(room.sessionName, room.roomFrom)
          if (roomInfo) {
            renderRoomInfoDialog(roomInfo)
          } else {
            throw new Error('roomInfo is empty')
          }
        } catch (error) {
          console.error('Failed to show room info:', error)
          toastrs.error(error, '获取房间信息失败')
        } finally {
          loadingScreen.open = false
        }
      })

      // 绑定事件监听器
      // 注意：为防止ID冲突，使用room.id作为唯一标识
      if (!isDisabled) {
        roomCard.querySelector('#btn-joinroom-' + room.id).addEventListener('click', () => {
          joinroom(activeAccount, room.roomFrom, room.id, room.sessionName, xuid)
        })
      }
      if (!enableOldUI) {
        document.getElementById(`btn-mode-${room.id}`).addEventListener('click', (e) => {
          toastr.info('按游戏模式搜索:' + gamemode[1])
          document.getElementById('search-input').value = gamemode[1]
          searchRooms(gamemode[1])
        })
        document.getElementById(`btn-version-${room.id}`).addEventListener('click', (e) => {
          toastr.info('按游戏版本搜索:' + room.version)
          document.getElementById('search-input').value = room.version
          searchRooms(room.version)
        })
        document.getElementById(`btn-lang-${room.id}`).addEventListener('click', (e) => {
          toastr.info('按语言搜索:' + langText)
          document.getElementById('search-input').value = 'lang::' + room.worldNameLang
          searchRooms('lang::' + room.worldNameLang)
        })
      }
      roomCard.querySelector('#btn-share-' + room.sessionName).addEventListener('click', () => {
        const shareUrl = `${clients ? 'https://lianji.qqaq.top' : window.location.origin}/share/?host=${room.host}&user=${userID === '未设置id' ? '' : userID}` //&avatar=${user_avatar}`
        document.getElementById('dialog-room-share').open = true
        document.getElementById('t-share-url').value = shareUrl
        document.getElementById('t-share-code').value = '/mcroom join ' + room.host
        navigator.clipboard
          .writeText(document.getElementById('t-share-url').value)
          .then(() => {
            toastr.success('分享链接已复制到剪贴板')
          })
          .catch((err) => {
            console.error('复制失败:', err)
            toastr.error('复制失败，请手动复制')
          })

        new AwesomeQR.AwesomeQR({
          text: shareUrl,
          size: 350,
          logoImage: 'favicon.ico', // 中间的 Logo 图片
          logoScale: 0.2, // Logo 大小比例
        })
          .draw()
          .then((dataURL) => {
            document.getElementById('share-qrcode').src = dataURL
          })
      })
    }
  })
}

function searchRooms(keyword) {
  loadingScreen.open = true
  if (!keyword.trim()) {
    filteredRoomList = [...allRoomList]
    displayRoomList()
    loadingScreen.open = false
    return
  }
  const searchTerm = keyword.toLowerCase()

  // 过滤房间
  filteredRoomList = allRoomList.filter((room) => {
    return (
      room.name.toLowerCase().includes(searchTerm) ||
      room.host.toLowerCase().includes(searchTerm) ||
      room.version.toLowerCase().includes(searchTerm) ||
      room.type.toLowerCase().includes(searchTerm) ||
      (gameMode[room.type] && (!room.isHardcore ? gameMode[room.type][1] : '极限').toLowerCase().includes(searchTerm)) ||
      room.sessionName.toLowerCase().includes(searchTerm) ||
      'lang::' + room.worldNameLang.toLowerCase() == searchTerm
    )
  })
  displayRoomList(filteredRoomList)
  if (filteredRoomList.length < 1) {
    toastrs.warning('QaQ~', '没有匹配到房间')
  }
  loadingScreen.open = false
}

//【Blued】验证码请勿泄露！您的验证码：173676，3分钟内有效。
// 任何索要验证码的行为都是诈骗！请勿告知他人，避免财产损失和信息泄露！

async function catchNewVersion() {
  //{"ver":'1.0.1',"notice":'修复了一些bug'}
  try {
    const res = await fetch('https://lianji.qqaq.top/new_notice.json')
    const data = await res.json()
    // console.log('1')
    //  toastr.success(data)
    if (data.ver != version_code) {
      const ps = Array.from(document.getElementsByClassName('newver-p'))
      document.getElementById('dialog-app-update').open = true
      ps[0].innerHTML = `版本号 :${data.ver}`
      ps[1].innerHTML = `${data.notice}`
    }
  } catch (error) {
    toastr.error('获取更新信息失败：<br>' + error)
    console.error('获取更新信息失败：', error)
  }
}

async function fetchLanguageCode() {
  try {
    const r = await fetch('src/fasttext-language-code.json')
    languageCode = await r.json()
  } catch (e) {
    console.error('error-get-languageCode:', e)
    toastrs.error('error-get-languageCode:' + e, '获取语言代码失败')
  }
}

async function fetchMarkdown() {
  const r = await fetch('./src/help.md', { headers: { 'Content-Type': 'text/plain' } })
  newerMarkdown = await r.text()
  // $(function () {
  //   var testView = editormd.markdownToHTML('newer-context', {
  //     markdown: newerMarkdown, // Also, you can dynamic set Markdown text
  //     // previewTheme: LDtheme ? 'default' : 'dark',
  //     emoji: true,
  //     htmlDecode: true, // Enable / disable HTML tag encode.
  //     // htmlDecode : "style,script,iframe",  // Note: If enabled, you should filter some dangerous HTML tags for website security.
  //   })
  // })
}

function openConfigDialog() {
  document.getElementById('dialog-user-settings').open = true
  const userInput = document.getElementById('input-userid')
  document.getElementById('enable-old-ui').checked = enableOldUI
  document.getElementById('hide-invalid-room').checked = hideInvalidroom
  document.getElementById('hide-other-room').checked = hideOtherroom
  document.getElementById('decode-color-string').checked = decodeColorstring
  document.getElementById('enable-TwoFr').checked = enableTwoFr
  userInput.value = localStorage.getItem('user_id')
  const accountList = document.getElementById('accounts-list')
  accountList.innerHTML = ''
  const active_radio = activeAccount > -1 ? activeAccount : accountInfo[0].id
  const radio_group = document.createElement('mdui-radio-group')
  radio_group.value = active_radio
  radio_group.id = 'radio-g'
  radio_group.innerHTML = `<p>选择共享账号（已添加为好友的）</p>`
  accountInfo.forEach((act) => {
    const acconutItem = document.createElement('mdui-radio')
    acconutItem.value = act.id
    acconutItem.innerHTML = `<span >${act.name}<span class="people-num ${act.isadd === true ? 'non-full' : 'full'}">(${act.isadd === true ? '可加好友' : '好友已满'})</span></span>`
    radio_group.appendChild(acconutItem)
  })
  accountList.appendChild(radio_group)
}
//Function define finish here
// mdui.setColorScheme('#02deeeff')
loadingScreen.open = true
if (first_go) {
  decodeColorstring = true
  localStorage.setItem('decode_color_string', true)
}
//event listen
document.getElementById('dialog-close-room-info').addEventListener('click', (e) => {
  document.getElementById('dialog-room-info').open = false
})

document.getElementById('settings-btn').addEventListener('click', (e) => {
  openConfigDialog()
})
document.getElementById('dialog-cancel').addEventListener('click', (e) => {
  document.getElementById('dialog-user-settings').open = false
})
document.getElementById('dialog-save').addEventListener('click', saveUserConfig)
document.getElementById('search-btn').addEventListener('click', () => {
  const searchInput = document.getElementById('search-input')
  searchRooms(searchInput.value)
})

// 回车搜索
document.getElementById('search-input').addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    searchRooms(e.target.value)
  }
})

document.getElementById('dialog-next').addEventListener('click', (e) => {
  // openConfigDialog()
  localStorage.setItem('is_first_times', 'false')
  first_go = false
  document.getElementById('dialog-new-user').open = false
})

document.getElementById('dialog-next-help').addEventListener('click', (e) => {
  document.getElementById('dialog-help').open = true

  document.getElementById('dialog-new-user').open = false
})

document.getElementById('fab-reload').addEventListener('click', (e) => {
  loadingScreen.open = true
  fetchRoomlist().then(() => {
    displayRoomList(allRoomList)
    loadingScreen.open = false
  })
})

document.getElementById('fab-chat').addEventListener('click', (e) => {
  document.getElementById('dialog-chat').open = true
})

document.getElementById('dialog-done').addEventListener('click', (e) => {
  document.getElementById('dialog-chat').open = false
})

document.getElementById('dialog-addqq').addEventListener('click', (e) => {
  window.open('https://qm.qq.com/q/8iSvKQjKus')
})

document.getElementById('dialog-newer').addEventListener('click', (e) => {
  document.getElementById('dialog-help').open = true
  // const dialogaccountList = document.getElementById('dialog-accounts-list')
  // dialogaccountList.innerHTML = ''
  // const active_radio = activeAccount > -1 ? activeAccount : accountInfo[0].id
  // const radio_group = document.createElement('mdui-radio-group')
  // radio_group.value = active_radio
  // radio_group.id = 'radio-g'
  // radio_group.innerHTML = ``
  // accountInfo.forEach((act) => {
  //   const acconutItem = document.createElement('mdui-radio')
  //   acconutItem.value = act.id
  //   acconutItem.innerHTML = `<span >${act.name}<span class="people-num ${act.isadd === true ? 'non-full' : 'full'}">(${act.isadd === true ? '可添加好友' : '好友已满'})</span></span>`
  //   radio_group.appendChild(acconutItem)
  // })
  // dialogaccountList.appendChild(radio_group)
})

document.getElementById('dialog-exit').addEventListener('click', (e) => {
  document.getElementById('dialog-help').open = false

  if (first_go) {
    openConfigDialog()
  }
})
document.getElementById('dialog-exit1').addEventListener('click', (e) => {
  document.getElementById('dialog-help').open = false
  if (first_go) {
    openConfigDialog()
  }
})

document.getElementById('dialog-ca').addEventListener('click', (e) => {
  document.getElementById('dialog-app-update').open = false
})

document.getElementById('dialog-update').addEventListener('click', (e) => {
  document.getElementById('dialog-app-update').open = false
  window.open('https://lianji.qqaq.top/app-release.apk')
})

document.getElementById('dialog-share-done').addEventListener('click', (e) => {
  document.getElementById('dialog-room-share').open = false
})

document.getElementById('btn-copy-link').addEventListener('click', (e) => {
  navigator.clipboard
    .writeText(document.getElementById('t-share-url').value)
    .then(() => {
      toastr.success('分享链接已复制到剪贴板')
    })
    .catch((err) => {
      console.error('复制失败:', err)
      toastr.error('复制失败')
    })
})

document.getElementById('btn-copy-code').addEventListener('click', (e) => {
  navigator.clipboard
    .writeText(document.getElementById('t-share-code').value)
    .then(() => {
      toastr.success('加入指令已复制到剪贴板')
    })
    .catch((err) => {
      console.error('复制失败:', err)
      toastr.error('复制失败')
    })
})

document.getElementById('fab-theme').addEventListener('click', (e) => {
  if (!LDtheme) LDtheme = 1
  LDtheme++
  if (LDtheme >= 4) LDtheme = 1
  mdui.setTheme(mdui_theme[LDtheme][0])
  document.getElementById('fab-theme').icon = mdui_theme[LDtheme][1]
  toastr.info(mdui_theme[LDtheme][2])
  localStorage.setItem('themes', LDtheme)
})

document.getElementById('dialog-feedback').addEventListener('click', (e) => {
  document.getElementById('dialog-efeedback').open = true
  const name = localStorage.getItem('f-name')
  const mail = localStorage.getItem('f-mail')

  if (userID && userID != '未设置id' && !name) {
    document.getElementById('dialog-feedback-name').value = userID
  } else if (name) {
    document.getElementById('dialog-feedback-name').value = name
  }
  if (mail) document.getElementById('dialog-feedback-mail').value = mail
})

document.getElementById('fab-menu').addEventListener('click', (e) => {
  const fabContainer = document.getElementById('fab-container')
  const fabMenuButton = e.currentTarget

  // Toggle the open state class on the container
  const isOpen = fabContainer.classList.toggle('fab-menu-open')

  // Change the icon and tooltip based on the state
  if (isOpen) {
    fabMenuButton.icon = 'add'
    fabMenuButton.parentElement.content = '关闭' // Update tooltip text
  } else {
    fabMenuButton.icon = 'menu'
    fabMenuButton.parentElement.content = '菜单' // Restore original tooltip text
  }
})

document.getElementById('dialog-fdone').addEventListener('click', (e) => {
  document.getElementById('dialog-efeedback').open = false
})
document.getElementById('dialog-feedback-submit').addEventListener('click', async (e) => {
  const aa = document.getElementById('dialog-feedback-name').value
  const b = document.getElementById('dialog-feedback-mail').value
  const c = document.getElementById('dialog-feedback-context').value
  if (!aa) return toastr.error('昵称不能为空')
  if (!b) return toastr.error('邮箱不能为空')
  if (!document.getElementById('dialog-feedback-mail').validity.valid) return toastr.error('邮箱填写有误')
  if (!c) return toastr.error('内容不能为空')
  loadingScreen.open = true
  const data = {
    username: aa,
    email: b,
    content: c,
    url: clients ? 'https://lianji.qqaq.top' : window.location.origin,
  }
  try {
    const a = await fetch('https://feedback.qqaq.top', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (!a.ok) throw new Error('feedback-HTTP-err:' + a.status)
    localStorage.setItem('f-name', aa)
    localStorage.setItem('f-mail', b)
    toastrs.success('感谢 Thanks!', '成功提交反馈')
    document.getElementById('dialog-efeedback').open = false
    loadingScreen.open = false
  } catch (e) {
    /// document.getElementById('dialog-efeedback').open = false
    loadingScreen.open = false
    localStorage.setItem('f-name', aa)
    localStorage.setItem('f-mail', b)
    toastrs.error(e, '提交反馈失败')
  }
})

document.getElementById('sort-by-time').addEventListener('click', () => {
  currentSortMethod = 'time'
  toastr.info('已按时间排序')
  displayRoomList(filteredRoomList)
})

document.getElementById('sort-by-name').addEventListener('click', () => {
  currentSortMethod = 'name'
  toastr.info('已按房间名称排序')
  displayRoomList(filteredRoomList)
})

document.getElementById('sort-by-host').addEventListener('click', () => {
  currentSortMethod = 'host'
  toastr.info('已按房主名称排序')
  displayRoomList(filteredRoomList)
})

document.getElementById('sort-by-none').addEventListener('click', () => {
  currentSortMethod = 'none'
  toastr.info('已取消排序')
  displayRoomList(filteredRoomList)
})

let debug_click_count = 0
document.getElementById('span-userid').addEventListener('click', (e) => {
  debug_click_count++
  if (debug_click_count >= 10) {
    debug_click_count = 0
    document.getElementById('dialog-dev').open = true
  }
})
const CheckVconsole = document.getElementById('enable_vconsole')
CheckVconsole.addEventListener('click', (e) => {
  enbaleVconsole = !CheckVconsole.checked
  localStorage.setItem('enable_vconsole', enbaleVconsole)
})
// document.getElementById('demo-card1').addEventListener('click', (e) => {
//   document.getElementById('ui-choose-old').value = 'false'
// })
// document.getElementById('demo-card2').addEventListener('click', (e) => {
//   document.getElementById('ui-choose-old').value = 'true'
// })
// document.getElementById('btn-save-ui').addEventListener('click', (e) => {
//   const uic = document.getElementById('ui-choose-old').value === 'true' ? true : false
//   enableOldUI = uic
//   localStorage.setItem('enable_old_ui', enableOldUI)
//   displayRoomList(allRoomList)
//   document.getElementById('dialog-cardui-choose').open = false
//   toastr.success('成功保存配置')
// })
// [公告] 近期，有不法分子频繁通过短信、电话等方式，
// 以“甘权联机”、“MiniWorld联机”等理由诱导用户点击诈骗链接。
// 据悉，在点击链接后，用户30秒内自动跑路，同时手机自动下载《迷你世界》，造成用户的巨大损失。
// 2025/08/10 11:37

///

///

///

///
const AI_CONFIG = {
  apiKey: 'ab592778WocANima_mcLiAnji114514shaoyUbiub', //Key
  apiUrl: 'https://glm-netlify.netlify.app/api/paas/v4/chat/completions',
  model: 'glm-4-flash', 
}

const aiChatWindow = document.getElementById('ai-chat-window')
const aiMessagesArea = document.getElementById('ai-messages-area')
const aiInput = document.getElementById('ai-input')
const aiSendBtn = document.getElementById('ai-send-btn')
const aiReasoningBox = document.getElementById('ai-reasoning-container')
const aiReasoningContent = document.getElementById('ai-reasoning-content')

let isGenerating = false
let messageHistory = [] // 上下文

// 1. 打开/关闭 AI 窗口
document.getElementById('fab-ai').addEventListener('click', () => {
  const isOpen = !aiChatWindow.classList.contains('ai-chat-closed')
  if (isOpen) {
    closeAIChat()
  } else {
    openAIChat()
  }

  // 关闭 FAB 菜单
  const fabContainer = document.getElementById('fab-container')
  if (fabContainer.classList.contains('fab-menu-open')) {
    document.getElementById('fab-menu').click()
  }
})

document.getElementById('ai-close-btn').addEventListener('click', closeAIChat)

function openAIChat() {
  aiChatWindow.classList.remove('ai-chat-closed')
  aiInput.focus()
}

function closeAIChat() {
  aiChatWindow.classList.add('ai-chat-closed')
}

// 2. 清空历史
document.getElementById('ai-clear-btn').addEventListener('click', () => {
  aiMessagesArea.innerHTML = `
    <div class="ai-message ai-welcome">
      ✨ 对话已重置。
    </div>`
  messageHistory = []
  aiReasoningBox.style.display = 'none'
  toastr.info('对话记录已清空')
})
/**
 * 解析并执行 AI 返回的指令
 * 格式: %!COMMAND:ACTION:PARAM%
 * 例如: %!COMMAND:RELOAD_ROOMLIST%
 *       %!COMMAND:SEARCH:生存%
 * @param {string} text AI 返回的原始文本
 * @returns {string} 去除指令后的纯文本
 */
function executeAICommands(text) {
  // 正则匹配 %!COMMAND:动作:参数%
  // 组1: ACTION (例如 RELOAD_ROOMLIST)
  // 组2: PARAM (可选，例如 搜索关键字)
  const commandRegex = /%!COMMAND:([A-Z_]+)(?::(.*?)?)?%/g

  let cleanText = text
  let match

  // 循环查找所有指令
  while ((match = commandRegex.exec(text)) !== null) {
    const fullCommandStr = match[0]
    const action = match[1]
    const param = match[2] ? match[2].trim() : ''

    console.log(`[AI Command] 检测到指令: ${action}, 参数: ${param}`)

    try {
      switch (action) {
        case 'RELOAD_ROOMLIST':
          toastr.info('AI 正在刷新房间列表...')
          // 调用现有的刷新逻辑
          document.getElementById('fab-reload').click()
          cleanText = cleanText.replace(fullCommandStr, '\n> 🤖AI尝试刷新房间列表 \n')
          break

        case 'SEARCH':
          if (param) {
            toastr.info(`AI 正在搜索: ${param}`)
            document.getElementById('search-input').value = param
            cleanText = cleanText.replace(fullCommandStr, '\n> 🤖AI尝试搜索房间 \n')
            searchRooms(param) // 调用 s.js 里现有的搜索函数
          }
          break

        case 'JOIN_ROOM':
          // 注意：加入房间通常需要复杂的 ID (session, roomid 等)
          // AI 很难直接凭空生成正确的 ID。
          // 这里的逻辑是：先搜索该房主，提示用户点击
          if (param) {
            try {
              const params = JSON.parse(param)
              toastr.info(`正在加入房间: ${params.name}`)
              joinroom(activeAccount, params.roomfrom, params.id, params.session, xuid)
              cleanText = cleanText.replace(fullCommandStr, '\n> 🤖AI尝试加入房间 \n')
            } catch (e) {
              toastrs.error('加入房间失败', e)
            }
          }
          break

        case 'TOAST':
          // 允许 AI 弹出提示框
          if (param) toastr.success(param)
          break

        default:
          console.warn('未知指令:', action)
          cleanText = cleanText.replace(fullCommandStr, '')
      }
    } catch (e) {
      console.error('指令执行失败:', e)
      cleanText = cleanText.replace(fullCommandStr, '')
    }

    // 从显示的文本中删除指令字符串，以免用户看到乱码
  }

  return cleanText
}
// 3. 发送消息逻辑
async function sendAIMessage() {
  const text = aiInput.value.trim()
  if (!text || isGenerating) return

  // UI 更新：添加用户消息
  appendMessage(text, 'user')
  aiInput.value = ''
  isGenerating = true
  aiSendBtn.disabled = true
  let times = new Date()
  const messages = [
    {
      role: 'system',
      content: `当前时间${times.toLocaleString()},用户的游戏名称为${userID},xuid为${xuid},头像URL:${user_avatar}，用户选择的共享账号(-1为未选择)id:${activeAccount} 。当前房间列表：${JSON.stringify(allRoomList)} 共${allRoomList.length}房间 当前共享账号：${JSON.stringify(accountInfo)} 共${accountInfo.lenth}账号`,
    },
    ...messageHistory,
    { role: 'user', content: text },
  ]

  // UI 更新：准备 AI 消息气泡
  const aiMessageBubble = appendMessage('...', 'assistant')
  aiReasoningBox.style.display = 'none' // 隐藏旧的思考
  aiReasoningContent.innerText = ''

  try {
    const response = await fetch(AI_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: messages,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`API Error: ${response.status} - ${errText}`)
    }

    // 流式读取
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let fullContent = ''
    let fullReasoning = ''

    // 清空 "..." 占位符
    aiMessageBubble.innerHTML = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()

      for (const line of lines) {
        // ... (中间的流式解析逻辑不变) ...
        const trimmed = line.trim()
        if (!trimmed.startsWith('data: ')) continue
        const jsonStr = trimmed.replace('data: ', '')
        if (jsonStr === '[DONE]') break

        try {
          const json = JSON.parse(jsonStr)
          const delta = json.choices[0]?.delta
          if (!delta) continue

          // 处理思考过程 (reasoning_content)
          if (delta.reasoning_content) {
            fullReasoning += delta.reasoning_content
            if (aiReasoningBox.style.display === 'none') {
              aiReasoningBox.style.display = 'block'
              // 将思考框移动到最新的 AI 消息上方
              aiMessagesArea.insertBefore(aiReasoningBox, aiMessageBubble)
            }
            aiReasoningContent.innerText = fullReasoning
            scrollToBottom()
          }

          // 处理正文内容
          if (delta.content) {
            fullContent += delta.content
            // 简单的换行处理，如果想支持 Markdown，可以在这里引入 marked.js
            aiMessageBubble.innerHTML = formatAIResponse(fullContent)
            scrollToBottom()
          }
        } catch (e) {
          console.warn('JSON Parse error', e)
        }

        // ...
      }
    }

    // ==========================================
    // 【新增/修改】流传输结束后，执行指令并清洗文本
    // ==========================================

    // 1. 执行指令，并获取清洗后的文本
    const finalCleanContent = executeAICommands(fullContent)

    // 2. 更新 UI，移除指令字符串
    aiMessageBubble.innerHTML = formatAIResponse(finalCleanContent)
    console.log(formatAIResponse(finalCleanContent))

    // 3. 保存到历史 (保存清洗后的，还是原始的？建议保存原始的以便上下文连贯，或者清洗后的)
    // 这里我们保存清洗后的，避免 AI 下次对话产生幻觉重复执行
    messageHistory.push({ role: 'user', content: text })
    messageHistory.push({ role: 'assistant', content: finalCleanContent })

    // 限制历史长度防止 Token 溢出
    if (messageHistory.length > 10) messageHistory = messageHistory.slice(-10)
  } catch (error) {
    console.error(error)
    aiMessageBubble.innerHTML += `<br><span style="color:rgb(var(--mdui-color-error))">[出错]: ${error.message}</span>`
    toastr.error('AI 请求失败，请稍后重试')
  } finally {
    isGenerating = false
    aiSendBtn.disabled = false
    aiInput.focus()
  }
}

// 辅助函数：添加消息到界面
function appendMessage(content, role) {
  const div = document.createElement('div')
  div.className = `ai-message ${role}`
  // 用户消息直接显示文本（防止XSS），AI消息稍后处理
  if (role === 'user') div.textContent = content
  else div.innerHTML = content

  aiMessagesArea.appendChild(div)
  scrollToBottom()
  return div
}

function formatAIResponse(text) {
  if (!text) return ''

  // 1. 基础工具
  function escapeHtml(str) {
    return str.replace(
      /[&<>"']/g,
      (m) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;',
        }[m])
    )
  }

  // 行内解析（递归使用）
  function parseInline(str) {
    if (!str) return ''
    return str
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="ai-image" loading="lazy" referrerpolicy="no-referrer" onclick="window.open(this.src)" title="点击查看大图"/>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  }

  const placeholders = []

  function createPlaceholder(htmlContent) {
    const id = `__PH_${placeholders.length}__`
    placeholders.push(htmlContent)
    return id
  }

  let processed = text

  // --- 步骤 A: 提取代码块 (最优先) ---
  processed = processed.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, content) => {
    const html = `<pre><div class="code-header">${lang || 'text'}</div><code class="language-${lang}">${escapeHtml(content)}</code></pre>`
    return createPlaceholder(html)
  })

  // --- 步骤 B: 提取表格 (全新逻辑) ---
  // 策略：先捕获所有连续的“管道符行”，不管内部结构，然后在回调中验证
  // 正则：匹配 (行首或换行) + (连续的 [空格|内容|空格换行] 块)
  const tableRegex = /(?:^|\n)((?:[ \t]*\|.*\|[ \t]*(?:\n|$))+)/g

  processed = processed.replace(tableRegex, (match, tableBlock) => {
    const rows = tableBlock.trim().split('\n')

    // 验证：至少要有两行，且第二行必须是分割线 (|---|)
    if (rows.length < 2) return match

    // 检查第二行是否只包含 | - : 空格
    const separatorLine = rows[1].trim()
    // 移除头尾的 | 后，中间必须只包含 - : 和空格
    const cleanSeparator = separatorLine.replace(/^\||\|$/g, '')
    if (!/^[-:| ]+$/.test(cleanSeparator)) {
      return match // 不是表格，退回普通文本
    }

    // 开始构建 HTML
    let html = '<div class="md-table-wrapper"><table>'

    // 1. 表头 (Row 0)
    const headerCells = rows[0].trim().split('|')
    // 过滤掉因为行首行尾 | 而产生的空字符串
    const validHeaders = headerCells.filter((c, i, arr) => i > 0 && i < arr.length - 1)

    html += '<thead><tr>'
    validHeaders.forEach((h) => {
      html += `<th>${parseInline(escapeHtml(h.trim()))}</th>`
    })
    html += '</tr></thead>'

    // 2. 表体 (从 Row 2 开始，跳过分割线)
    html += '<tbody>'
    for (let i = 2; i < rows.length; i++) {
      const rowStr = rows[i].trim()
      if (!rowStr) continue

      const cells = rowStr.split('|')
      // 同样的过滤逻辑
      const validCells = cells.filter((c, i, arr) => i > 0 && i < arr.length - 1)

      html += '<tr>'
      validCells.forEach((c) => {
        html += `<td>${parseInline(escapeHtml(c.trim()))}</td>`
      })
      html += '</tr>'
    }
    html += '</tbody></table></div>'

    return createPlaceholder(html)
  })

  // --- 步骤 C: 提取引用 ---
  processed = processed.replace(/(?:^|\n)((?:[ \t]*> .+(?:\n|$))+)/g, (match, quoteBlock) => {
    const lines = quoteBlock.trim().split('\n')
    const content = lines
      .map((line) => {
        const text = line.replace(/^[ \t]*> ?/, '')
        return parseInline(escapeHtml(text))
      })
      .join('<br>')
    return createPlaceholder(`<blockquote>${content}</blockquote>`)
  })

  // --- 步骤 D: 提取列表 ---
  processed = processed.replace(/(?:^|\n)((?:[ \t]*[-*] [^\n]+(?:\n|$))+)/g, (match, listBlock) => {
    const items = listBlock.trim().split('\n')
    const listHtml = items.map((item) => `<li>${parseInline(escapeHtml(item.replace(/^[ \t]*[-*] /, '')))}</li>`).join('')
    return createPlaceholder(`<ul>${listHtml}</ul>`)
  })

  processed = processed.replace(/(?:^|\n)((?:[ \t]*\d+\. [^\n]+(?:\n|$))+)/g, (match, listBlock) => {
    const items = listBlock.trim().split('\n')
    const listHtml = items.map((item) => `<li>${parseInline(escapeHtml(item.replace(/^[ \t]*\d+\. /, '')))}</li>`).join('')
    return createPlaceholder(`<ol>${listHtml}</ol>`)
  })

  // --- 步骤 E: 分割线 ---
  processed = processed.replace(/(?:^|\n)(?:[-*_] ?){3,}(?:\n|$)/g, (match) => {
    return createPlaceholder('<hr class="ai-hr">')
  })

  // --- 步骤 F: 处理剩余文本 ---

  processed = escapeHtml(processed) // 全局转义

  // 标题处理 (修复字号问题)
  processed = processed.replace(/^(#{1,6})\s+(.*$)/gm, (match, hashes, content) => {
    const level = hashes.length
    return `<h${level}>${parseInline(content.trim())}</h${level}>`
  })

  // 剩余行内解析
  processed = parseInline(processed)

  // 换行
  processed = processed.replace(/\n/g, '<br>')

  // --- 步骤 G: 还原占位符 ---
  processed = processed.replace(/__PH_(\d+)__/g, (match, index) => {
    return placeholders[index]
  })

  return processed
}

// 辅助函数：滚动到底部
function scrollToBottom() {
  aiMessagesArea.scrollTop = aiMessagesArea.scrollHeight
}

// 绑定发送事件
aiSendBtn.addEventListener('click', sendAIMessage)
aiInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') sendAIMessage()
})
mdui.setTheme(mdui_theme[LDtheme][0])
toastr.options = {
  // toastr配置
  closeButton: true,
  debug: false,
  progressBar: true,
  positionClass: 'toast-top-center',
  showDuration: '400',
  hideDuration: '1000',
  timeOut: '3000',
  extendedTimeOut: '1000',
  showEasing: 'swing',
  hideEasing: 'linear',
  showMethod: 'fadeIn',
  hideMethod: 'fadeOut',
}
document.getElementById('fab-theme').icon = mdui_theme[LDtheme][1]
fetchAccount()
//fetchMarkdown()
if ((userID != '未设置id') | (xuid != '')) {
  document.getElementById('avatar-view').src = user_avatar
} else {
  document.getElementById('avatar-view').src = ``
}
document.getElementById('span-userid').innerHTML = userID
if (localStorage.getItem('enable_old_ui') === null) {
  //document.getElementById('dialog-cardui-choose').open = true
  enableOldUI = false
}
if (first_go) {
  document.getElementById(
    'newer-video'
  ).innerHTML = `<iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=115026656497077&bvid=BV1VCbzztE1g&cid=31691440462&p=1&autoplay=0"
          scrolling="no"
          border="0"
          width="95%"
          frameborder="no"
          framespacing="0"
          allowfullscreen="true">
          </iframe>`
  document.getElementById('dialog-new-user').open = true
}
if (clients) {
  console.log('type:Electron')
  //toastr.success('Detect Electron !')
  catchNewVersion()
} else {
  console.log('type:浏览器')
}
fetchLanguageCode().then(() => {
  fetchRoomlist().then(() => {
    displayRoomList(allRoomList)
    loadingScreen.open = false
  })
})

class Debug {
  /**
   * 清除浏览器的 localStorage 并打印结果
   */
  static clearLocalStorage() {
    try {
      localStorage.clear()
      console.log('Local storage has been cleared. Current item count:', localStorage.length)
      toastr.info('Local storage has been cleared. Current item count:' + localStorage.length)
    } catch (e) {
      console.error('Failed to clear local storage:', e)
      toastr.error('Failed to clear local storage:' + e)
    }
  }

  static logCookies() {
    console.log('Cookies:', document.cookie)
    toastr.info('Cookies:' + document.cookie)
  }

  static testToastr() {
    toastr.error('Error msg')
    toastr.warning('Warning msg')
    toastr.success('Success msg')
    toastr.info('Info msg')
    console.log('测试Toastr成功')
  }
}
