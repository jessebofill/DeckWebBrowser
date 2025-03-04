import { VFC } from "react";

interface BrowserTabCloserProps {
    close: Function
}

export const BrowserTabCloser: VFC<BrowserTabCloserProps> = ({ close }) => {
    return <div
        onClick={() => close()}
        style={{
            height: '20px',
            width: '20px',
            lineHeight: '20px',
            backgroundColor: '#a0aaba88',
            borderRadius: '50%',
            boxShadow: '#9598b2ba 0px 0px 3px 2px',
        }}
        className="tabAddonExit"
    >
        <div style={{ fontSize: '18px', textAlign: 'center', transform: 'translate(1px, 1px)' }}>X</div>
    </div>;
}
