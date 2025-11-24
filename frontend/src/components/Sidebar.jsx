import React from 'react'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import { Link as RouterLink, useLocation } from 'react-router-dom'

const items = [
  {to: '/', label: 'Dashboard'},
  {to: '/marketing', label: 'Marketing'},
  {to: '/income', label: 'Income'},
  {to: '/expenses', label: 'Expenses'},
  {to: '/invoices', label: 'Invoices'},
  {to: '/reports', label: 'Reports'},
]

export default function Sidebar({ mobileOpen, onDrawerToggle, drawerWidth = 240 }){
  const location = useLocation()

  const drawerContent = (
    <Box sx={{ width: drawerWidth }} role="presentation">
      <List sx={{mt: 1}}>
        <ListItem>
          <strong>Menu</strong>
        </ListItem>
        <Divider />
        {items.map(i => (
          <ListItem key={i.to} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={i.to}
              selected={location.pathname === i.to}
              onClick={onDrawerToggle}
            >
              <ListItemText primary={i.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="mailbox folders">
      {/* Temporary drawer for mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile.
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
      >
        {drawerContent}
      </Drawer>

      {/* Permanent drawer for desktop */}
      <Drawer
        variant="permanent"
        sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  )
}
