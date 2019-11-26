import { stackPrompt, stackAlert } from './modules/StackAlert'
document.querySelector('h1').addEventListener('click', function () {
  stackPrompt('Hello', 'warning')
    .closeOnYes()
    .yes(function () {
      stackAlert('Ok mec', 'success')
      console.log('hi')
    })
})
