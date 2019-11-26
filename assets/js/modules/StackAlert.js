class StackAlert {
  constructor (message, type = 'light', expiration = null, closable = true, stackable = true) {
    const element = document.createElement('div')
    element.classList.add('stack-alert')
    let content = `<div class="alert alert-${type}">
        <div class="stack-alert-content">
            ${message}
        </div>`
    if (closable) {
      content += `<
        <div class="stack-alert-close">
            <i class="fas fa-times"></i>
        </div>`
    }
    content += '</div>'

    element.innerHTML = content
    if (closable) {
      element.querySelector('.stack-alert-close').addEventListener('click', () => {
        this.close()
      })
    }
    if (StackAlert.instances.length === 1 && !StackAlert.instances[0].stackable) {
      StackAlert.instances[0].wiggle()
    } else {
      if (StackAlert.instances.length > 0) {
        document.querySelector('body').insertBefore(element, document.querySelector('.stack-alert'))
      } else {
        document.querySelector('body').appendChild(element)
      }
      this.element = element
      this.height = element.getBoundingClientRect().height
      this.translated = 0
      this.stackable = stackable

      if (StackAlert.instances.length > 0) {
        StackAlert.instances.forEach(instance => {
          instance.moveUp(this.height)
        })
      }
      StackAlert.instances.push(this)

      if (expiration) {
        setTimeout(() => { this.close() }, expiration * 1000)
      }
    }
  }

  close () {
    this.element.classList.add('closed')

    for (let i = 0; i < this.getIndex(); i++) {
      StackAlert.instances[i].moveDown(this.height)
    }
    StackAlert.instances.splice(this.getIndex(), 1)

    setTimeout(() => {
      this.element.remove()
    }, 1000)
  }

  moveUp (delta) {
    this.element.style.transform = 'translateY(' + (this.translated - delta) + 'px)'
    this.translated -= delta
  }

  moveDown (delta) {
    this.moveUp(-delta)
  }

  getIndex () {
    return StackAlert.instances.indexOf(this)
  }

  wiggle () {
    this.element.classList.add('wiggle')
    setTimeout(() => {
      this.element.classList.remove('wiggle')
    }, 1000)
  }

  static autoFromFlash () {
    document.querySelectorAll('.flashmsg').forEach(msg => {
      const messageText = msg.innerHTML
      const messageType = msg.dataset.type
      msg.remove()
      StackAlert(messageText, messageType)
    })
  }
}
StackAlert.instances = []

class StackPrompt extends StackAlert {
  constructor (message, type, textYes = 'Oui', textNo = 'Annuler', stackable = false) {
    message += `</div>
        <div class="stack-alert-prompt">
            <button class="btn btn-${type} action-yes">${textYes}</a>
            <button class="btn btn-light action-no">${textNo}</a>
            `
    super(message, type, null, false, stackable)
    this.element.querySelector('.action-yes').focus()
    this.yesActions = []
    this.noActions = []
    this.element.querySelector('.action-yes').addEventListener('click', () => {
      this.yesActions.forEach(action => {
        action()
      })
    })
    this.element.querySelector('.action-no').addEventListener('click', () => {
      this.noActions.forEach(action => {
        action()
      })
    })
  }

  yes (action) {
    console.log(action)
    this.yesActions.push(action)
    return this
  }

  no (action) {
    this.noActions.push(action)
    return this
  }

  closeOnYes () {
    this.yesActions.unshift(() => {
      this.close()
    })
    return this
  }

  closeOnNo () {
    this.noActions.unshift(() => {
      this.close()
    })
    return this
  }
}

export function stackAlert (...args) {
  return new StackAlert(...args)
}
export function stackPrompt (...args) {
  return new StackPrompt(...args)
}

export default stackAlert
