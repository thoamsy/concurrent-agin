import React, {
  useState,
  Suspense,
  useTransition,
  useEffect,
  useDeferredValue,
  memo,
} from 'react';

import { fetchProfileData } from './fakeAPI';
import Gallery from './List';

const getNextId = id => (id === 3 ? 0 : id + 1);
const initialResource = fetchProfileData(0);

const SlowList = memo(function SlowList({ length = 30, str }) {
  return (
    <ul>
      {Array.from({ length }, (_, i) => {
        const end = performance.now() + 5;
        while (performance.now() < end) {}
        return <li key={i}>{str}</li>;
      })}
    </ul>
  );
});

function App() {
  const [resource, setResource] = useState(initialResource);
  const [count, setCount] = useState(0);
  const [startTransition, isPending] = useTransition({ timeoutMs: 1000 });

  useEffect(() => {
    // 因为新的 Render 模式，会将所有的 setState 都批处理。所以 legacy 模式下，每次 click 这里会输出 5 次
    // 而新的 Concurrent or BlockRender 模式下，都只是输出一次。
    console.count('update');
  }, [count]);

  return (
    <>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(() => {
            const nextUserId = getNextId(resource.userId);
            setResource(fetchProfileData(nextUserId));
          });
        }}
      >
        {isPending ? 'loading…' : 'Next'}
      </button>
      <ProfilePage resource={resource} />
    </>
  );
}

function ProfilePage({ resource }) {
  const [value, setValue] = useState('');
  // 这里虽然起到了一定的效果，但是似乎还没有达到官方🌰中的那种体验
  const foo = useDeferredValue(value, { timeoutMs: 1000 });
  return (
    <Suspense fallback={<h1>Loading profile...</h1>}>
      {/* <ProfileDetails resource={resource} />
      <Suspense fallback={<h1>Loading posts...</h1>}>
        <ProfileTimeline resource={resource} />
      </Suspense> */}
      <Gallery />
      {/* <input
        type="text"
        value={value}
        onChange={event => setValue(event.target.value)}
      />
      <hr />
      <SlowList str={foo} /> */}
    </Suspense>
  );
}

function ProfileDetails({ resource }) {
  const user = resource.user.read();
  return <h1>{user.name}</h1>;
}

function ProfileTimeline({ resource }) {
  const posts = resource.posts.read();
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.text}</li>
      ))}
    </ul>
  );
}

export default App;
