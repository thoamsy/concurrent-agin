# 关于新 API 的简单尝试


## SuspenseList

`revealOrder` 支持了三个 props
1. `forwards`，无论后面的 Suspense 哪个先被 resolve，一定会按 children 的顺序来依次 render
2. `backwards`，无论前面的 Suspense 哪个先被 resolve，一定会按 children 的逆序来依次 render
3. `together`，类似 `Promise.all`，要求所有 Suspense 都被 render 后才会同时 render


另外碰到了一个 bug（其实很早就碰到过了），下面这段代码，如果我被 `imgCache` 用 ref 来写进组件中，就会导致无限循环，目前还不知道原因。打算提个 issue 问问 React team 的人

```js
const imgCache = {};

const Image = ({ src }) => {
  const fetchImage = src => {
    return fetch(src)
      .then(res => {
        if (res.ok) {
          return res.blob();
        }
        throw res.statusText;
      })
      .then(blob => {
        imgCache[src] = URL.createObjectURL(blob);
      });
  };

  const imgSrc = useMemo(() => fetchImage(src), [src]);

  if (imgCache[src]) {
    return (
      <img
        style={{ width: 320, maxHeight: '100%' }}
        src={imgCache[src]}
      />
    );
  } else {
    throw imgSrc;
  }
};

```

另外，Suspense 也多了一个 `unstable` 的 props，不过我不打算去探索这个 props，而且很可能会在未来被移除


## useTransition

这个 API 虽然看上去很神秘，其实本质上和我们业务代码中常常写的很像，先设置标记位，在运行结束后重置它
```js
setPending(true)

next(() => {
  try {
    await callback();
  } finally {
    setPending(false)
  }
});
```

next 算是 ConcurrentMode 的核心，也是这个 hooks 最重要的地方。它会运行这里的代码，但会以一个**较低的优先级去渲染视图**。这也就解释了 transition 的现象：`pending` 先设置为 true，引起 re-render。接着调用 startTransition 里的逻辑，并重置 pending。

注意到这个 hooks 还接受一个 `{ timeoutMs }` 参数，它表示的含义是：timeoutMs 如果还没执行的话，会马上去执行。否则会根据其他任务的优先级来决定是否运行，如果没有其他更高优先级的任务了，也会提前去运行 transition 的逻辑。

## useDeferredValue

待填坑🌚

目前有一个让我比较困惑的地方，这两个 hooks 本质上是组合了现有的 hooks 如 `useCallback, useEffect` 来实现的。但是它们的 dep array 中，将 `{timeoutMs: 1000}` 也放了进去。但是在我们使用的过程中，很显然只会写**字面量**而不是常量，根据 `{a: 1} !== {a:1}` 这可能会导致额外的消耗。


## Batch 的调整

如果你对 React 有足够了解的话就知道，它的 Batch update 只发生在生命周期或者事件的**直接回调**中，如果用到了 `setTimeout` or `Promise` 这些回调，这里面的 setState 就不再批处理而是同步的。

比如在 legacy 的 ReactDOM 里

```js
  const [label, setLabel] = useState('yeah');
  useEffect(() => console.count('update'), [label])
  const foo = () => {
    setLabel('one');
    setTimeout(() => {
      setLabel('two');
      setLabel('three');
      setLabel('four');
      setLabel('five');
    }, 1000);
  };
```
上面的代码，update 会打印出 5 次。而 ConcurrentMode or BlockingMode 里，只会打印出两次。这是否会带来破坏性改动呢？目前来看似乎还不会，
因为 第一个 setLabel 和 setTimeout 里的 setLabel 不会被批处理，也就保证之前一些基于 setTimeout 的 hack 可以正常。而且相比之前，为了实现某些特殊的优化，我们还会使用 `unstable_batchedUpdates`，目前这个方法还在，但是不确定是否未来会被删除。
