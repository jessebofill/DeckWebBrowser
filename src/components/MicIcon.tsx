import { useEffect, useState, VFC } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import BrowserTabHandler, { MicAccess } from '../classes/BrowserTabHandler';

interface MicIconProps {
    tabHandler: BrowserTabHandler;
}

export const MicIcon: VFC<MicIconProps> = ({ tabHandler }) => {
    const [micIcon, setMicIcon] = useState(tabHandler.micAccess);
    const setState = (access: MicAccess) => {
        setMicIcon(access);
        tabHandler.micAccess = access;
    }
    useEffect(() => { tabHandler.setMicIconHeader = setState },[]);

    return micIcon === MicAccess.BLOCKED ? <FaMicrophoneSlash size={'19px'}  style={{ margin: 'auto' }} /> :
        micIcon === MicAccess.ALLOWED ? <FaMicrophone viewBox='-134 0 620 512' size={'19px'} style={{ margin: 'auto' }} /> :
            <></>;
};