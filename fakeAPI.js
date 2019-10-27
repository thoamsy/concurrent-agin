export function fetchProfileData(userId) {
  let userPromise = fetchUser(userId);
  let postsPromise = fetchPosts(userId);
  return {
    userId,
    user: wrapPromise(userPromise),
    posts: wrapPromise(postsPromise),
  };
}

// Suspense integrations like Relay implement
// a contract like this to integrate with React.
// Real implementations can be significantly more complex.
// Don't copy-paste this into your project!
function wrapPromise(promise) {
  const STATUS = {
    PENDING: 'PENDING',
    ERROR: 'ERROR',
    SUCCESS: 'SUCCESS',
  };

  let status = STATUS.PENDING;
  let result;
  let suspender = promise.then(
    r => {
      status = STATUS.SUCCESS;
      result = r;
    },
    e => {
      status = STATUS.ERROR;
      result = e;
    },
  );
  return {
    read() {
      switch (status) {
        case STATUS.PENDING:
          throw suspender;
        case STATUS.ERROR:
          throw result;
        case STATUS.SUCCESS:
          return result;
        default:
          break;
      }
    },
  };
}

export function fetchUser(userId) {
  console.log('fetch user ' + userId + '...');
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('fetched user ' + userId);
      switch (userId) {
        case 0:
          resolve({
            name: 'Ringo Starr',
          });
          break;
        case 1:
          resolve({
            name: 'George Harrison',
          });
          break;
        case 2:
          resolve({
            name: 'John Lennon',
          });
          break;
        case 3:
          resolve({
            name: 'Paul McCartney',
          });
          break;
        default:
          throw Error('Unknown user.');
      }
    }, 2000 * Math.random());
  });
}

export function fetchPosts(userId) {
  console.log('fetch posts for ' + userId + '...');
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('fetched posts for ' + userId);
      switch (userId) {
        case 0:
          resolve([
            {
              id: 0,
              text: 'I get by with a little help from my friends',
            },
            {
              id: 1,
              text: "I'd like to be under the sea in an octupus's garden",
            },
            {
              id: 2,
              text: 'You got that sand all over your feet',
            },
          ]);
          break;
        case 1:
          resolve([
            {
              id: 0,
              text: 'Turn off your mind, relax, and float downstream',
            },
            {
              id: 1,
              text: 'All things must pass',
            },
            {
              id: 2,
              text: "I look at the world and I notice it's turning",
            },
          ]);
          break;
        case 2:
          resolve([
            {
              id: 0,
              text: 'Living is easy with eyes closed',
            },
            {
              id: 1,
              text: "Nothing's gonna change my world",
            },
            {
              id: 2,
              text: 'I am the walrus',
            },
          ]);
          break;
        case 3:
          resolve([
            {
              id: 0,
              text: 'Woke up, fell out of bed',
            },
            {
              id: 1,
              text: 'Here, there, and everywhere',
            },
            {
              id: 2,
              text: 'Two of us sending postcards, writing letters',
            },
          ]);
          break;
        default:
          throw Error('Unknown user.');
      }
    }, 2000 * Math.random());
  });
}
