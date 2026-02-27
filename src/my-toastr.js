const tip = document.getElementById('dialog-toastr-tip')
const dialog = document.getElementById('dialog-toastr')
const icon = document.getElementById('dialog-toastr-icon')
const iconBg = document.getElementById('dialog-toastr-icon-background')
const msg = document.getElementById('dialog-toastr-message')
const msgCopy = document.getElementById('dialog-toastr-message-copy')
const gameStartbtn = document.getElementById('dialog-toastr-start-game')
const closeBtn = document.getElementById('dialog-toastr-close')
const imgs = {
  info: 'M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z',
  warning:
    'M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z',
  error: 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z',
  success: 'M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z',
}
msgCopy.addEventListener('click', () => {
  navigator.clipboard
    .writeText(msg.value)
    .then(() => {
      toastr.success('已复制到剪贴板')
    })
    .catch((err) => {
      console.error('复制失败:', err)
      toastr.error('复制失败，请手动复制')
    })
})

class toastrs {
  static error(a, b = '', c, d) {
    tip.innerText = b
    icon.setAttribute('d', imgs.error)
    iconBg.style.backgroundColor = '#f44336'
    msg.value = a
    if (c) {
      gameStartbtn.style.display = 'block'
      closeBtn.setAttribute('variant', 'outlined')
    } else {
      gameStartbtn.style.display = 'none'
      closeBtn.setAttribute('variant', 'filled')
    }
    if (!d) msg.style.display = 'block'
    if (d) msg.style.display = 'none'
    dialog.open = 'true'
  }
  static warning(a, b = '', c, d) {
    tip.innerText = b
    icon.setAttribute('d', imgs.warning)
    iconBg.style.backgroundColor = '#ff9800'
    msg.value = a
    if (c) {
      gameStartbtn.style.display = 'block'
      closeBtn.setAttribute('variant', 'outlined')
    } else {
      gameStartbtn.style.display = 'none'
      closeBtn.setAttribute('variant', 'filled')
    }
    if (!d) msg.style.display = 'block'
    if (d) msg.style.display = 'none'
    dialog.open = 'true'
  }
  static success(a, b = '', c, d) {
    tip.innerText = b
    icon.setAttribute('d', imgs.success)
    iconBg.style.backgroundColor = '#4caf50'
    msg.value = a
    if (c) {
      gameStartbtn.style.display = 'block'
      closeBtn.setAttribute('variant', 'outlined')
    } else {
      gameStartbtn.style.display = 'none'
      closeBtn.setAttribute('variant', 'filled')
    }
    if (!d) msg.style.display = 'block'
    if (d) msg.style.display = 'none'
    dialog.open = 'true'
  }
  static info(a, b = '', c, d) {
    tip.innerText = b
    icon.setAttribute('d', imgs.info)
    iconBg.style.backgroundColor = '#2196f3'
    msg.value = a
    if (c) {
      gameStartbtn.style.display = 'block'
      closeBtn.setAttribute('variant', 'outlined')
    } else {
      gameStartbtn.style.display = 'none'
      closeBtn.setAttribute('variant', 'filled')
    }
    if (!d) msg.style.display = 'block'
    if (d) msg.style.display = 'none'
    dialog.open = 'true'
  }
}
