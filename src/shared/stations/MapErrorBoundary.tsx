import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  onBackToList: () => void;
}

interface State {
  message: string | null;
}

/**
 * Aísla los fallos del mapa.
 *
 * Sin esto, cualquier excepción dentro del mapa desmonta el árbol entero y deja
 * la pantalla en blanco, sin lista, sin filtros y sin forma de salir salvo
 * recargar — que instalada como PWA no es evidente. Con la barrera, el fallo se
 * queda dentro del recuadro del mapa y se puede volver a la lista.
 *
 * Tiene que ser una clase: React no ofrece barreras de error con hooks.
 */
export class MapErrorBoundary extends Component<Props, State> {
  state: State = { message: null };

  static getDerivedStateFromError(error: unknown): State {
    return {
      message: error instanceof Error ? error.message : "Error desconocido",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("El mapa ha fallado", error, info.componentStack);
  }

  render() {
    if (this.state.message === null) return this.props.children;

    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 flex flex-col items-center text-center gap-3">
        <h3 className="font-bold text-lg">No se ha podido cargar el mapa</h3>
        <p className="text-sm text-base-content/60 max-w-sm">
          Puedes seguir consultando los precios en la lista.
        </p>
        <p className="text-xs text-base-content/40 font-mono break-all max-w-sm">
          {this.state.message}
        </p>
        <button
          type="button"
          className="btn btn-neutral btn-sm min-h-11"
          onClick={() => {
            this.setState({ message: null });
            this.props.onBackToList();
          }}
        >
          Volver a la lista
        </button>
      </div>
    );
  }
}
