/* eslint-env jest */
import React, { Component } from 'react'
import { mount } from 'enzyme'
import withData from './'

class ExpectComponent extends Component {
  render () {
    expect(Object.keys(this.props)).toHaveLength(2)
    expect(this.props.foo).toEqual('bar')
    expect(this.props.children).toEqual('baz')

    return null
  }
}

describe('withData()', () => {
  it('returns an enhancer function', () => {
    expect(withData()).toBeInstanceOf(Function)
  })

  it('should set the displayName correctly', () => {
    expect(withData()(
      class Foo extends Component {
        render () {
          return <div />
        }
      }
    ).displayName).toBe('WithData(Foo)')

    expect(withData()(
      // In this case, we don't want to specify a displayName because we're testing what
      // happens when one isn't defined.
      class extends Component {
        render () {
          return <div />
        }
      }
    ).displayName).toBe('WithData(_class)') // FIXME: should be WithData(Component)
  })

  describe('with empty parameters', () => {
    it('renders owner props', () => {
      const WrappedComponent = withData()(ExpectComponent)
      mount(<WrappedComponent foo='bar'>baz</WrappedComponent>)
    })
  })

  describe('with async props', () => {
    it('renders ...', (done) => {
      const mockComponent = jest.fn(() => <div />)
      const mockOp = jest.fn(() => Promise.resolve())
      const WrappedComponent = withData(props => ({ foo: mockOp }))(mockComponent)
      const wrapper = mount(<WrappedComponent bar='baz'>qux</WrappedComponent>)

      // console.log(mockComponent.mock.calls)
      expect(mockComponent.mock.calls).toHaveLength(1)

      setTimeout(() => {
        console.dir(mockComponent.mock.calls[0][0].foo)
        expect(mockComponent.mock.calls).toHaveLength(2)
        // expect(mockComponent.mock.calls[2][0].life).toBe(42)
        done()
      }, 50)
    })
  })
})
