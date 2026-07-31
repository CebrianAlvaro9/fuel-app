import { useEffect, useState } from "react";

/**
 * Si la página está desplazada más allá de un umbral.
 *
 * Usa histéresis (dos umbrales, no uno) a propósito: quien consume esto encoge
 * un elemento pegajoso, lo que reduce la altura del documento y puede devolver
 * el scroll justo por debajo del umbral, expandiéndolo otra vez y entrando en
 * un parpadeo. Con la banda muerta entre `collapseAt` y `expandAt` no ocurre.
 */
export const useScrolled = (collapseAt = 28, expandAt = 6): boolean => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      setScrolled((prev) => {
        if (!prev && y > collapseAt) return true;
        if (prev && y < expandAt) return false;
        return prev;
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [collapseAt, expandAt]);

  return scrolled;
};
