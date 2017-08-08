import React, { Component } from 'react'

/**
 * A ideia é este HOC ser utilizado isoladamente para obter as propriedades necessárias, mas também
 * poderá ser utilizado em conjunto com um container para servir de cache a outros componentes que
 * necessitem da mesma informação.
 *
 * Também deve ser necessário capacidade de modificar/enviar info para o servidor, (POST/PATCH).
 *
 * Inspiração: https://github.com/tkh44/react-refetch
 *
 * compose(
 *   withData(({id}) => ({ user: () => userApi.getUserById(id) })),
 *   withData(props => ({ onSave: (user) => userApi.saveUser(user) }), { lazy: true })
 * )(UserProfile) // vai ter props.user e props.onSave
 * ```
 *
 *
 * @param  {Function} mapAsyncProps  The fields object. Each property represents a field to be retrieved by
 *                          some async API.
 * @param  {Object} options Options object
 * @return Function         [description]
 */
export default function withData (
  mapAsyncProps = props => ({}),
  {
    getDisplayName = name => `WithData(${name})`,
    lazy = false
  } = {}
) {
  return function wrapWithData (WrappedComponent) {
    // TODO check if WrappedComponent is a function, use invariant package?

    const wrappedComponentName = WrappedComponent.displayName ||
      WrappedComponent.name ||
      'Component'

    const displayName = getDisplayName(wrappedComponentName)

    class WithData extends Component {
      constructor (props, context) {
        super(props, context)

        this.resolve = this.resolve.bind(this)
        this.resolveAll = this.resolveAll.bind(this)

        // Gets the props to be resolved before passing them to the WrappedComponent.
        // They're set as an object property since they're not needed for rendering.
        this.asyncProps = mapAsyncProps(props, context)

        // Get an array of all async props.
        this.asyncPropsKeys = []
        for (let key in this.asyncProps) {
          this.asyncPropsKeys.push(key)
        }

        // Each prop is then represented as state
        this.state = this
          .asyncPropsKeys
          .reduce((acc, key) => ({
            ...acc,
            [key]: {
              refetch: () => this.resolveAndSave(key), // TODO: allow params
              data: undefined,
              error: undefined,
              loading: !lazy
            }
          }), {})
      }

      componentDidMount () {
        if (lazy) {
          return
        }

        this.resolveAll()
      }

      componentWillUnmount () {
        this.willUnmount = true
      }

      resolveAll () {
        // Call each key to get the Promise.
        // Also sets the `.catch()` handler so the promise can be resolved with the Error.
        const promises = this
           .asyncPropsKeys
           .map(this.resolve)

         // Waits for all Promises to resolve, then calculates the new state based on the Promise's
         // result or error.
        return Promise
           .all(promises)
           .then(results =>
             results.reduce((acc, state, index) => ({
               ...acc,
               [this.asyncPropsKeys[index]]: state
             }), {}))
           .then(newState => this.setState(newState))
      }

      resolve (key) {
        const keyState = this.state[key]

        // If HOC is lazy or current prop is not loading
        if (lazy || !keyState.loading) {
          this.setState({
            ...this.state,
            [key]: {
              ...keyState,
              loading: true
            }
          })
        }

        const handler = keyState => result => ({
          ...keyState,
          loading: false,
          data: !(result instanceof Error) ? result : undefined,
          error: result instanceof Error ? result : undefined
        })

        const factory = this.asyncProps[key]
        const promise = factory()

        return promise
          .then(handler(keyState), handler(keyState))
      }

      resolveAndSave (key) {
        this.resolve(key).then(keyState => this.setState({
          ...this.state,
          [key]: keyState
        }))
      }

      render () {
        return <WrappedComponent {...this.state} {...this.props} />
      }
    }

    WithData.WrappedComponent = WrappedComponent
    WithData.displayName = displayName

    // TODO: hot reload when not in production ? think there's no need to re-fetch data

    // TODO: hoist static methods?

    return WithData
  }
}
