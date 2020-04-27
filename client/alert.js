import React from 'react'
import css from '@unrest/css'

import globalHook from 'use-global-hook'

export const config = {
  duration: 10000,
}

css.snackbar = css.CSS({
  __default: 'outer',
  outer: 'snackbar',
  item: 'item',
  container: 'container',
})

const _add = (type) => (store, content, extra = {}) =>
  store.actions.add({ content, type, ...extra })

const actions = {
  add: (store, item) => {
    const { items } = store.state
    item = {
      id: Math.random(),
      timeout: config.duration,
      ...item,
    }
    items.push(item)
    store.setState({ items })
    item.timeout &&
      setTimeout(() => store.actions.remove(item.id), item.timeout)
  },
  kill: (store, id) => {
    // instantly remove an alert. Will be useful when further actions might replace one alert with another
    const items = store.state.items.filter((i) => i.id !== id)
    if (items.length !== store.state.items.length) {
      store.setState({ items })
    }
  },
  remove: (store, id) => {
    const { items } = store.state
    const item = store.state.items.find((item) => item.id === id)
    if (!item) {
      return
    }
    item.dismissed = new Date().valueOf()
    store.setState({ items })
    setTimeout(() => store.actions._cleanup(), 1000)
  },
  _cleanup: (store) => {
    // garbage collecting function to remove items after dismissal
    const now = new Date().valueOf()
    const items = store.state.items.filter(
      (i) => !i.dismissed || i.dismissed > now - 500,
    )
    if (items.length !== store.state.items.length) {
      store.setState({ items })
    }
  },
  info: _add('info'),
  success: _add('success'),
  error: _add('error'),
  warning: _add('warning'),
}

const makeHook = globalHook(React, { items: [] }, actions)

export const connect = (Component) => (props) => {
  const [state, actions] = makeHook()
  const { items } = state
  const alert_props = { items, ...actions }
  return <Component {...props} alert={alert_props} />
}

export const List = connect((props) => {
  const { items, remove } = props.alert
  return (
    <div className={css.snackbar()}>
      <div className={css.snackbar.container()}>
        {items.map((item) => (
          <div
            key={item.id}
            className={css.snackbar.item({ dismissed: item.dismissed })}
          >
            <div className={css.alert[item.type]()}>
              {item.content}
              <a
                onClick={() => remove(item.id)}
                className={css.icon('close cursor-pointer')}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

const TestAlert = (() => {
  const types = ['info', 'success', 'error', 'warning']
  const words = ['what', 'do']
  let i = 0
  return connect((props) => {
    const onClick = () => {
      const type = types[i % types.length]
      const text = words[i % words.length]
      alert[type](text)
      i++
    }
    const { alert } = props
    return <button onClick={onClick}>Click me</button>
  })
})()

export default {
  connect,
  List,
  TestAlert,
  config,
}
