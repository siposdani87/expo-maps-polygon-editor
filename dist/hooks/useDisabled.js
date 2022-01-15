import { useEffect, useState } from 'react';
export const useDisabled = (onDisabled, oldDisabled) => {
    const [disabled, setDisabled] = useState(oldDisabled ?? false);
    useEffect(() => {
        setDisabled(oldDisabled ?? false);
        if (oldDisabled) {
            onDisabled();
        }
    }, [oldDisabled, onDisabled]);
    return disabled;
};
//# sourceMappingURL=useDisabled.js.map