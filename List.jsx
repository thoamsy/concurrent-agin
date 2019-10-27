import React, { Suspense, SuspenseList, useMemo, useState } from 'react';

// 我不知道为什么这里用 useRef 就会导致无限循环，或许我应该提一个 issue。
const imgCache = {};
let error = {};

const Image = ({ src }) => {
  const fetchImage = src => {
    return fetch(src)
      .then(res => {
        if (res.ok) {
          return res.blob();
        }
        error[src] = res.statusText;
        throw res.statusText;
      })
      .then(blob => {
        imgCache[src] = URL.createObjectURL(blob);
      });
  };

  const imgSrc = useMemo(() => fetchImage(src), [src]);

  if (error.current) {
    throw error.current;
  } else if (imgCache[src]) {
    return (
      <img
        style={{ width: 320, maxHeight: '100%' }}
        src={imgCache[src]}
        alt="jklk"
      />
    );
  } else {
    throw imgSrc;
  }
};

const Gallery = () => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('revealOrder') || 'forwards';
  });

  const changeAndSaveMode = event => {
    const mode = event.target.name;
    setMode(mode);
    localStorage.setItem('revealOrder', mode);
  };

  return (
    <SuspenseList revealOrder={mode}>
      <label>
        forwards
        <input
          type="radio"
          name="forwards"
          checked={mode === 'forwards'}
          onChange={changeAndSaveMode}
        />
      </label>
      <br />
      <label>
        backwards
        <input
          type="radio"
          id="backwards"
          name="backwards"
          checked={mode === 'backwards'}
          onChange={changeAndSaveMode}
        />
      </label>
      <br />
      <label>
        together
        <input
          type="radio"
          id="together"
          name="together"
          checked={mode === 'together'}
          onChange={changeAndSaveMode}
        />
      </label>
      <br />
      <Suspense fallback={<p>loading img1</p>}>
        <Image src="https://images.unsplash.com/photo-1572151812899-c6e62ba62931?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1311&q=80" />
      </Suspense>
      <Suspense fallback={<p>loading img2</p>}>
        <Image src="https://images.unsplash.com/photo-1572165888349-b0b1c67a7e92?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80" />
      </Suspense>
      <Suspense fallback={<p>loading img3</p>}>
        <Image src="https://images.unsplash.com/photo-1572153710996-b0f626a7c976?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1867&q=80" />
      </Suspense>
    </SuspenseList>
  );
};

export default Gallery;
