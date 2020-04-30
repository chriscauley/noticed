import React from 'react'
import { Link } from 'react-router-dom'
import auth from '@unrest/react-auth'
import css from '@unrest/css'
import gps from '../gps'

const { AuthNavLink } = auth

const auth_links = [
  (user) => ({
    text: 'Photos',
    to: '/photo/',
    badge: countMissingPhotos(user),
  }),
]

const countMissingPhotos = (user) =>
  user.photos.filter((p) => !p.location_id).length

export default function Nav() {
  return (
    <header className={css.nav.outer()}>
      <section className={css.nav.section()}>
        <Link to="/" className={css.nav.brand()}>
          Noticed
        </Link>
      </section>
      <section className={css.nav.section('flex items-center')}>
        <gps.NavLink />
        <AuthNavLink links={auth_links} badge={countMissingPhotos} />
      </section>
    </header>
  )
}
