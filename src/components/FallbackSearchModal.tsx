import { ChangeEvent, VFC, useCallback, useState } from 'react';
import { TabManager } from '../classes/TabManager';
import { ModalRoot, gamepadDialogClasses } from 'decky-frontend-lib';
import { FocusableInput } from '../native-components/FocusableInput';

interface FallbackSearchModalProps {
    tabManager: TabManager
    closeModal?: () => void
}

export const FallbackSearchModal: VFC<FallbackSearchModalProps> = ({ tabManager, closeModal }) => {
    const url = ""
    const [value, setValue] = useState(url)

    const submit = useCallback(() => {
        tabManager.browserRequest(value)
        tabManager.focusActiveBrowser()
        closeModal?.()
    }, [value])

    return (
        <ModalRoot closeModal={closeModal}>
            <div className='DialogInput_Wrapper'>
                <FocusableInput
                    className={`DialogInput ${gamepadDialogClasses.BasicTextInput}`}
                    noFocusRing={true}
                    placeholder='Enter URL or Search Term'
                    strEnterKeyLabel='Go'
                    onChange={(evt: ChangeEvent<HTMLInputElement>) => setValue(evt.target.value)}
                    onKeyDown={(evt: KeyboardEvent) => { if (evt.key === 'Enter') submit() }}
                    onEnterKeyPress={() => (submit(), 'VKClose')}
                    onMenuButton={submit}
                    onMenuActionDescription='Go'
                />
            </div>
        </ModalRoot>
    )
}