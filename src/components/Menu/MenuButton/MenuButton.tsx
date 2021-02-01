import React, {useEffect, useState} from 'react';
import './MenuButton.scss';
import {ReactComponent as CloseIcon} from "assets/icon-close-white.svg";

type MenuButtonProps = {
    toggle: boolean; // Button functions as toggle
    onToggle: (active: boolean) => void; // What should happen onToggle / onClick

    toggleStartLabel: string;
    toggleStopLabel: string;

    direction: 'left' | 'right';

    children: React.ReactNode;
}

function MenuButton(props: MenuButtonProps) {

    const [status, setStatus] = useState(false);

    useEffect(() => {
        props.onToggle(status);
    }, [status])

    return (<button className={`menu-button ${status ? 'menu-button--active':'menu-button--disabled'} menu-button--${props.direction}`} onClick={_ => setStatus(currStatus => !currStatus)}>
        <span className='menu-button__tooltip'>{!status ? props.toggleStartLabel : props.toggleStopLabel}</span>
        {props.children}
        <CloseIcon className='menu-button__icon menu-button__icon--close'/>
    </button>);
}

export default MenuButton;