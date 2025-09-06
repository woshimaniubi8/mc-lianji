//文件:s.js
//描述:前端逻辑
//时间:2025-08-30
//作者:wohenaighs@163.com

// 这怎么一半敖丙一半哪吒呀😱这敖丙混起来是怎么回事啊出去出去😡不要了不要了😱😱😱不要了😭不要我要[发怒]
// 你要他干啥呀[发怒]反正我是不要[发怒]快看[憨笑]我命由我不由天🤬这是谁说的[发怒]所以啊[憨笑]才不要敖丙进来呢[发怒]
// 爱[憨笑]这个放到我这不刚刚好吗[憨笑]正好我的敖丙缺了一半[憨笑]就算你拼上了敖丙也特别的丑[发怒]倒是好玩啊[愉快]你看

const version_code = '1.0.3'
const clients = 0 //1: electron  0: 浏览器
const LOCAL_TEST = 0

const mdui_theme = {
  1: ['light', 'light_mode', '浅色主题'],
  2: ['dark', 'dark_mode', '深色主题'],
  3: ['auto', 'hdr_auto', '主题跟随系统'],
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
let first_go = localStorage.getItem('is_first_times') === null ? true : false
let LDtheme = localStorage.getItem('themes') || 1
LDtheme = Number(LDtheme)
let xuid = localStorage.getItem('user_xuid') || ''
let user_avatar = localStorage.getItem('user_avatar') || ''
let headimg = ''
let newerMarkdown
let accountInfo = []
let roomList = []

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
    toastr.error('获取账号列表失败 :' + error)
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
      toastr.warning(res_data.message_zh_CN)
    } else {
      toastr.success(res_data.message_zh_CN)
    }
    loadingScreen.open = false
  } catch (error) {
    console.error('join failed :', error)
    toastr.error('广播房间失败 :' + error)
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
      toastr.error('获取玩家信息失败：' + error)
      loadingScreen.open = false
    }
  }
}

async function fetchRoomlist() {
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
        roomFrom: room.roomfrom,
      })
      // console.log('Room: ' + JSON.stringify(room))
      filteredRoomList = [...allRoomList]
      return allRoomList
    })
  } catch (error) {
    console.error('Error fetching room list:', error)
    toastr.error('获取房间列表失败：' + error)
    return []
  }
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
  localStorage.setItem('hide_invalid_room', hideInvalidroom)
  localStorage.setItem('hide_other_room', hideOtherroom)
  localStorage.setItem('decode_color_string', decodeColorstring)
  localStorage.setItem('enable_old_ui', enableOldUI)
  await displayRoomList(allRoomList)
  loadingScreen.open = false
  document.getElementById('dialog-cancel').style.display = 'block'
  document.getElementById('dialog-user-settings').open = false
  localStorage.setItem('is_first_times', 'false')
  first_go = false
  toastr.success('更新配置成功')
}
async function displayRoomList(roomsToDisplay = filteredRoomList) {
  const roomListElement = document.querySelector('.room-list')
  roomListElement.innerHTML = ''
  const uniqueRooms = [...new Map(roomsToDisplay.map((room) => [room.id, room])).values()]

  if (uniqueRooms.length === 0) {
    // 您可以在这里添加一个 "没有找到房间" 的提示信息
    roomListElement.innerHTML = '<p style="text-align: center; color: grey;">当前没有可显示的房间。</p>'
    // await fetchRoomlist(); // 如果希望没房间时自动刷新，可以保留这句
    return
  }

  uniqueRooms.forEach((room) => {
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
      const verIcon = Number(room.version.slice(0, 4)) >= 1.2 ? '/src/new_mc.png' : '/src/old_mc.png'
      const roomCard = document.createElement('mdui-card')
      roomCard.className = 'room-card' // 使用新的 class

      // 使用模板字符串构建 HTML，更清晰且无内联样式
      if (!enableOldUI) {
        roomCard.innerHTML = `
        <div class="room-card-header">
          <p id="room-name2" title="${room.name.replace(/§./g, '')}">${formatMinecraftText(room.name)}</p>
        </div>

        <div class="room-card-body">
          <div class="info-line">
            <img src="https://persona-secondary.franchise.minecraft-services.net/api/v1.0/profile/xuid/${room.xuid}/image/head" class="host-avatar" alt="Host Avatar"/>
            <span><a href="https://www.xbox.com/play/user/${room.host}" target="_blank" title="查看 ${room.host} 的Xbox主页"><strong>${room.host}</strong></span></a>
          </div>
          <div class="info-line">
            <mdui-icon name="people"></mdui-icon>
            <span>人数: <span class="${peopleNumClass}">${room.memberCount} / ${room.maxMemberCount}</span></span>
          </div>
          <div style="display:flex">
          <div class="info-line tags" style="margin-left:0px;" title="单击以搜索标签" id="btn-mode-${room.id}">
            <img src="src/${gamemode[0]}.png" width="18" height="18" style="image-rendering: pixelated;margin-left:1px;margin-right:2px"/>
            <span style="color:rgb(var(--mdui-color-on-primary))">${gamemode[1]}模式</span>
           </div>
            <div class="info-line tags" style="margin-left:5px;" title="单击以搜索标签" id="btn-version-${room.id}">
            <img src="${verIcon}" width="18" height="18" style="image-rendering: pixelated;margin-left:2px;"/>
            <span style="color:rgb(var(--mdui-color-on-primary))">${room.version}</span>
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
        document.querySelector('.room-list').style =
          'padding: 10px 0; display: grid ; grid-template-columns: repeat(auto-fill, minmax(35vh, 1fr)); gap: 10px; width: 98%; max-height: calc(100vh - 100px); margin: 0 auto;'
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
              style="vertical-align: -10%; margin-right: 6px"
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

      // 绑定事件监听器
      // 注意：为防止ID冲突，使用room.id作为唯一标识
      if (!isDisabled) {
        roomCard.querySelector('#btn-joinroom-' + room.id).addEventListener('click', () => {
          joinroom(activeAccount, room.roomFrom, room.id, room.sessionName, xuid)
        })
      }
      if (!enableOldUI) {
        document.getElementById(`btn-mode-${room.id}`).addEventListener('click', (e) => {
          document.getElementById('search-input').value = gamemode[1]
          searchRooms(gamemode[1])
        })
        document.getElementById(`btn-version-${room.id}`).addEventListener('click', (e) => {
          document.getElementById('search-input').value = room.version
          searchRooms(room.version)
        })
      }
      roomCard.querySelector('#btn-share-' + room.sessionName).addEventListener('click', () => {
        const shareUrl = `${clients ? 'https://lianji.qqaq.top' : window.location.origin}/share?id=${room.sessionName}&user=${userID === '未设置id' ? '' : userID}&avatar=${user_avatar}`
        document.getElementById('dialog-room-share').open = true
        document.getElementById('t-share-url').value = shareUrl
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
      room.sessionName.toLowerCase().includes(searchTerm)
    )
  })
  displayRoomList(filteredRoomList)
  if (filteredRoomList.length < 1) {
    toastr.warning('没有匹配到房间 QaQ')
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
    toastr.error('获取更新信息失败：' + error)
    console.error('获取更新信息失败：', error)
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
  if (first_go) {
    document.getElementById('dialog-cancel').style.display = 'none'
  }
  document.getElementById('dialog-user-settings').open = true
  const userInput = document.getElementById('input-userid')
  document.getElementById('enable-old-ui').checked = enableOldUI
  document.getElementById('hide-invalid-room').checked = hideInvalidroom
  document.getElementById('hide-other-room').checked = hideOtherroom
  document.getElementById('decode-color-string').checked = decodeColorstring
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
    acconutItem.innerHTML = `<span >${act.name}<span class="people-num ${act.isadd === true ? 'non-full' : 'full'}">(${act.isadd === true ? '可添加好友' : '好友已满'})</span></span>`
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
    if (!a.ok) throw new Error('Submit Failed, code:' + a.status)
    localStorage.setItem('f-name', aa)
    localStorage.setItem('f-mail', b)
    toastr.success('成功提交反馈')
    document.getElementById('dialog-efeedback').open = false
    loadingScreen.open = false
  } catch (e) {
    /// document.getElementById('dialog-efeedback').open = false
    loadingScreen.open = false
    localStorage.setItem('f-name', aa)
    localStorage.setItem('f-mail', b)
    toastr.error('提交反馈时发生错误:' + e)
  }
})

document.getElementById('demo-card1').addEventListener('click', (e) => {
  document.getElementById('ui-choose-old').value = 'false'
})
document.getElementById('demo-card2').addEventListener('click', (e) => {
  document.getElementById('ui-choose-old').value = 'true'
})
document.getElementById('btn-save-ui').addEventListener('click', (e) => {
  const uic = document.getElementById('ui-choose-old').value === 'true' ? true : false
  enableOldUI = uic
  localStorage.setItem('enable_old_ui', enableOldUI)
  displayRoomList(allRoomList)
  document.getElementById('dialog-cardui-choose').open = false
  toastr.success('成功保存配置')
})
// [公告] 近期，有不法分子频繁通过短信、电话等方式，
// 以“甘权联机”、“MiniWorld联机”等理由诱导用户点击诈骗链接。
// 据悉，在点击链接后，用户30秒内自动跑路，同时手机自动下载《迷你世界》，造成用户的巨大损失。
// 2025/08/10 11:37

///

///

///

///

mdui.setTheme(mdui_theme[LDtheme][0])
document.getElementById('fab-theme').icon = mdui_theme[LDtheme][1]
fetchAccount()
fetchMarkdown()
if ((userID != '未设置id') | (xuid != '')) {
  document.getElementById('avatar-view').src = user_avatar
} else {
  document.getElementById('avatar-view').src = ``
}
document.getElementById('span-userid').innerHTML = userID
if (localStorage.getItem('enable_old_ui') === null) {
  document.getElementById('dialog-cardui-choose').open = true
}
if (first_go) {
  document.getElementById('dialog-new-user').open = true
}
if (clients) {
  console.log('type:Electron')
  //toastr.success('Detect Electron !')
  catchNewVersion()
} else {
  console.log('type:浏览器')
}

fetchRoomlist().then(() => {
  displayRoomList(allRoomList)
  loadingScreen.open = false
})
