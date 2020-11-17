
export type ReactElement = ReactHostElement | ReactComponentElement;


// Can be DOM element if the host is browser.
export interface ReactHostElement {
    type: string,
    props: {
        children: ReactNodeList,
        className?: string,
        href?: string,
        [key: string]: any,
    }
}

export interface ReactComponentElement {
    type: ReactFunc,
    props: any
}

export type ReactFunc = (props: any) => ReactElement;

export type ReactNodeList = ReactNode | ReactEmpty;

export type ReactNode = ReactElement | ReactFragment | ReactText;

export type ReactFragment = Array<ReactNodeList>;

export type ReactText = string | number;

export type ReactEmpty = null | undefined | boolean;
