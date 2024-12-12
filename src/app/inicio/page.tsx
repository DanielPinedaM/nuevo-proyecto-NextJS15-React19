import FetchData from './fetchData';

/* Page() crea la ruta  http://localhost:3000/fetch-ssr */
export default function Page() {
  return (
    <>
      <h1>
        <a href='https://www.youtube.com/watch?v=_SPoSMmN3ZU&t=3701s' target='_blank'>
          Ejemplo: la data se carga en componente servidor con fetch SSR y hay un componente cliente q tiene un alert
        </a>
      </h1>

      {/*  <FetchData /> es componente servidor */}
      <FetchData />
    </>
  );
}