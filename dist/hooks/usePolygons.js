import { useEffect, useState } from 'react';
export const usePolygons = (oldPolygons) => {
    const [polygons, setPolygons] = useState(oldPolygons);
    useEffect(() => {
        setPolygons(oldPolygons);
    }, [oldPolygons]);
    return polygons;
};
//# sourceMappingURL=usePolygons.js.map