import { backendService } from "./classes/BackendService";
import { tabManager } from "./classes/TabManager";
import { SP_Window } from "./init"
import { tabContentRealY } from "./components/styling"

type FakeMouseEvtType = 'down' | 'move' | 'up'
class Mouse {
    globalCoords: { x: number; y: number }
    globalCoordOffsets: { x: number; y: number; };
    isPressed: boolean;
    constructor() {
        this.globalCoords = {
            x: 640,
            y: 400
        }
        this.globalCoordOffsets = {
            x: 0,
            y: 0
        }
        this.isPressed = false
    }
    updateCoords(dx: number, dy: number) {
        let { x: curX, y: curY } = this.globalCoords
        let newX = dx + curX >= 1280 ? 1279 : dx + curX < 0 ? 0 : dx + curX
        let newY = dy + curY >= 800 ? 799 : dy + curY < 0 ? 0 : dy + curY
        this.globalCoords.x = newX
        this.globalCoords.y = newY
    }
    move = (touchEvt: any) => {
        const dx = touchEvt[0].x - this.globalCoordOffsets.x
        const dy = touchEvt[0].y - this.globalCoordOffsets.y
        this.globalCoordOffsets.x = touchEvt[0].x
        this.globalCoordOffsets.y = touchEvt[0].y
        this.updateCoords(dx, dy)
        SteamClient.Input.SetMousePosition(Math.round(this.globalCoords.x), Math.round(this.globalCoords.y))
        if (this.isPressed) {
            const targetCoords = this.getTargetCoords()
            backendService.runInTarget(
                tabManager.getActiveTabHandler().id,
                this.dispatchFakeMouseEventInTarget,
                false,
                targetCoords.x,
                targetCoords.y,
                'move'
            )
        }
    }
    getTargetCoords() {
        const tX = this.globalCoords.x / 1.5
        const tY = (this.globalCoords.y - tabContentRealY) / 1.5
        return { x: tX, y: tY }
    }

    // simulateMouseEventInTarget = (targetX: number, targetY: number, eventType: MouseEvent['type']) => {
    //     console.log('element' )
    // }
    dispatchFakeMouseEventInTarget = (targetX: number, targetY: number, type: FakeMouseEvtType) => {
        const fakeMouseEvent = new CustomEvent('fake-mouse', {
            detail: {
                type: type,
                x: targetX,
                y: targetY
            }
        })
        document.dispatchEvent(fakeMouseEvent)
    }
}

// Dispatch the event on the button element
// export function dispatchClick() {
//     //global coords need to be translated to target window
//     document.elementFromPoint(mouse.globalCoords[0], mouse.globalCoords[1])?.dispatchEvent(event)
//     console.log('element', document.elementFromPoint(mouse.globalCoords[0], mouse.globalCoords[1]))
// }

export const mouse = new Mouse()