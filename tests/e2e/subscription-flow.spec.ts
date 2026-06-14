import { expect, test } from '@playwright/test'

test('user signs in and purchases a subscription', async ({ page }) => {
  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url()

    if (url.endsWith('/auth/login')) {
      await route.fulfill({
        json: {
          access_token: 'test-jwt',
          expires_in: 3600,
          user: { id: 'user-1', email: 'ada@example.com', name: 'Ada Lovelace', role: 'USER' },
        },
      })
      return
    }

    if (url.includes('/plans')) {
      await route.fulfill({
        json: {
          data: [{ id: '7c128cc9-c141-4e69-8ad1-0fbe24397fee', name: 'Pro', price: 29, currency: 'USD', billingPeriod: 'MONTHLY' }],
          page: 1,
          limit: 20,
          total: 1,
        },
      })
      return
    }

    if (url.endsWith('/subscriptions/checkout')) {
      await route.fulfill({
        json: { subscriptionId: 'sub-1', status: 'ACTIVE', expiresAt: null, cancelAtPeriodEnd: false },
      })
      return
    }

    if (url.includes('/subscriptions')) {
      await route.fulfill({ status: 404 })
      return
    }

    await route.fulfill({ status: 500 })
  })

  await page.goto('/login')
  await page.getByLabel('Email address').fill('ada@example.com')
  await page.getByLabel('Password').fill('password')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page.getByText('Good to see you, Ada.')).toBeVisible()
  await page.getByRole('link', { name: 'Plans' }).click()
  await expect(page).toHaveURL(/\/plans$/)
  await expect(page.getByRole('heading', { name: 'Pick the access that fits.' })).toBeVisible()
  await page.getByRole('button', { name: 'Choose Pro' }).click()
  await page.getByRole('button', { name: 'Pay securely' }).click()

  await expect(page.getByText('You are all set.')).toBeVisible()
  await expect(page.getByText('Payment confirmed')).toBeVisible()
})
