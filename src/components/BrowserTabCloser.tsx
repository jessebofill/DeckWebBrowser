import { VFC } from "react";

interface BrowserTabCloserProps {
    close: Function
}

export const BrowserTabCloser: VFC<BrowserTabCloserProps> = ({ close }) => {
    return <span
        onClick={() => close()}
        style={{
            height: 20,
            width: 20,
            backgroundColor: '#a0aaba88',
            borderRadius: '50%',
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '#9598b2ba 0px 0px 3px 2px',
        }}
        className="tabAddonExit"
    >
        <span style={{ fontSize: '18px', transform: 'translate(1px, 1px)' }}>X</span>
    </span>;
}
