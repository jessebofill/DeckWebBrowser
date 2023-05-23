import { SP_Window } from "./init"
import { log } from "./log"

const mouseCoords = [640, 400]
const offsets = [0, 0]

function updateMouse(dx, dy) {
    let [curX, curY] = mouseCoords
    let newX = dx + curX >= 1280 ? 1279 : dx + curX < 0 ? 0 : dx + curX
    let newY = dy + curY >= 800 ? 799 : dy + curY < 0 ? 0 : dy + curY
    mouseCoords[0] = newX
    mouseCoords[1] = newY
}

export function moveMouse(touchEvt) {
    console.log('x: ', touchEvt[0].x, ' y: ', touchEvt[0].y)
    const dx = touchEvt[0].x - offsets[0]
    const dy = touchEvt[0].y - offsets[1]
    offsets[0] = touchEvt[0].x
    offsets[1] = touchEvt[0].y
    updateMouse(dx, dy)
    SteamClient.Input.SetMousePosition(Math.round(mouseCoords[0]), Math.round(mouseCoords[1]))
}

const event = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
})

// Dispatch the event on the button element
export function dispatchClick() {
    //global coords need to be translated to target window
    SP_Window?.document.elementFromPoint(mouseCoords[0], mouseCoords[1])?.dispatchEvent(event)
    log('element', SP_Window?.document.elementFromPoint(mouseCoords[0], mouseCoords[1]))
}