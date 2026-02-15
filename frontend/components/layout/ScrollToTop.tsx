import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
    const location = useLocation();

    useEffect(() => {
        // Ensure each route starts at the top.
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, [location.pathname, location.search, location.hash]);

    return null;
}
