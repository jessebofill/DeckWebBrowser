import { backendService } from './classes/BackendService';

const targetScript = `
const clickEvent = new MouseEvent('click', {
    'view': window,
    'bubbles': true,
    'cancelable': true
})
let mouseDownElt
let selection = window.getSelection();
let range = document.createRange();
document.addEventListener('fake-mouse', (e) => {
    switch (e.detail.type) {
        case 'down':
            mouseDownElt = document.elementFromPoint(e.detail.x, e.detail.y)
            selection.removeAllRanges();
            startRange = document.caretRangeFromPoint(e.detail.x, e.detail.y);
            range.setStart(startRange.startContainer, startRange.startOffset);
            break
        case 'move':
            selection.removeAllRanges();
            const endRange = document.caretRangeFromPoint(e.detail.x, e.detail.y);
            range.setEnd(endRange.startContainer, endRange.startOffset);
            selection.addRange(range);
            break
        case 'up':
            const mouseUpElt = document.elementFromPoint(e.detail.x, e.detail.y)
            if(mouseUpElt === mouseDownElt) {
                mouseUpElt?.dispatchEvent(clickEvent)
            }
    }
});
`

export const loadScriptInTarget = (id: string) => {
    const load = (scriptString: string) => {
        console.log('loading')
        try {
            (async () => {
                const script = document.createElement('script');
                script.innerHTML = scriptString;
                document.head.appendChild(script);
            })();

        } catch (e) {
            console.error(e)
        }
    }
    return backendService.runInTarget(id, load, false, targetScript)
}

