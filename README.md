# react-with-data

> A React HOC for resolving promises and injecting them as props.


## Usage

```
npm install --save react-with-data
```

## Basic example

```js
const UserProfile = ({
  user: {
    data,
    error,
    loading,
  }
}) => (
  <div>
    {loading && <p>Loading...</p>}
    {error && <p>Could not load user profile!</p>}
    {data && <p>Hi, my name is {data.name} and I am {data.age}yo</p>}
  </div>
);

export default withAsync(props => ({
  user: () => fetch(`https://my.api.com/user/${props.id}`).then(res => res.json())
}))(App);
```
