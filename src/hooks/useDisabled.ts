import { useEffect, useState } from 'react';

export const useDisabled = (
    onDisabled: () => void,
    oldDisabled?: boolean,
): boolean => {
    const [disabled, setDisabled] = useState<boolean>(oldDisabled ?? false);

    useEffect(() => {
        setDisabled(oldDisabled ?? false);
        if (oldDisabled) {
            onDisabled();
        }
    }, [oldDisabled, onDisabled]);

    return disabled;
};
