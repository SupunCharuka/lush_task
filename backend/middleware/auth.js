import User from '../models/User.js'


export default async function devAuth(req, res, next) {
  try {
    const auth = req.headers['authorization']
    const headerId = req.headers['x-user-id'] || null
    let userId = null
    if (auth && typeof auth === 'string') {
      const parts = auth.split(' ')
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') userId = parts[1]
    }
    if (!userId && headerId) userId = headerId

    if (userId) {
      try {
        const user = await User.findById(userId)
        if (user) req.user = user
      } catch (e) {
        // ignore invalid id
      }
    }
    next()
  } catch (err) {
    next()
  }
}
