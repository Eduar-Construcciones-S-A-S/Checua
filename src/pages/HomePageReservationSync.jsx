import HomePage from './HomePage.jsx'

const HomePageReservationSync = (props) => {
  if (typeof window !== 'undefined') {
    window.__CHECUA_RESERVATION_DATA__ = props.reservationData || null
  }

  return <HomePage {...props} />
}

export default HomePageReservationSync
