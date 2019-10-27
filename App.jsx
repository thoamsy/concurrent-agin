import React, {
  useState,
  Suspense,
  useTransition,
  useEffect,
  useDeferredValue,
} from 'react';

import { fetchProfileData } from './fakeAPI';

const getNextId = id => (id === 3 ? 0 : id + 1);
const initialResource = fetchProfileData(0);

function App() {
  const [resource, setResource] = useState(initialResource);
  const [count, setCount] = useState(0);
  const [startTransition, isPending] = useTransition({ timeout: 1000 });

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
            setTimeout(() => {
              setCount(c => c + 1);
              setCount(c => c + 1);
              setCount(c => c + 1);
              setCount(c => c + 1);
              setCount(c => c + 1);
            });
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
  return (
    <Suspense fallback={<h1>Loading profile...</h1>}>
      <ProfileDetails resource={resource} />
      <Suspense fallback={<h1>Loading posts...</h1>}>
        <ProfileTimeline resource={resource} />
      </Suspense>
      <Suspense fallback="Loading a slow list…">
        <SlowList />
      </Suspense>
    </Suspense>
  );
}

function SlowList({ length = 30 }) {
  const [value, setValue] = useState('');
  return (
    <>
      <input
        type="text"
        value={value}
        onChange={event => setValue(event.target.value)}
      />
      <ul>
        {Array.from({ length }, (_, i) => {
          const end = Date.now() + 5;
          while (Date.now() < end) {}
          return <li key={i}>{value}</li>;
        })}
      </ul>
    </>
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
