import React from 'react'
import { Link } from 'react-router-dom'
import auth from '@unrest/react-auth'
import css from '@unrest/css'

const { AuthNavLink } = auth

export default function Nav() {
  return (
    <header className={css.nav.outer()}>
      <section className={css.nav.section()}>
        <Link to="/" className={css.nav.brand()}>
          Noticed
        </Link>
      </section>
      <section className={css.nav.section()}>
        <AuthNavLink />
      </section>
    </header>
  )
}
