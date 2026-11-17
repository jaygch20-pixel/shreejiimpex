export async function mockApi(page) {
  await page.route('http://localhost:5000/api/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api', '');
    let status = 200;
    let body = { success: true, data: [] };

    if (path === '/categories') {
      body = {
        success: true,
        data: [
          { _id: 'category-1', name: 'Java', slug: 'java', image: { url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/java.jpg' } },
          { _id: 'category-2', name: 'Ankara', slug: 'ankara', image: { url: '/demo-assets/kitango-02.svg' } },
          { _id: 'category-3', name: 'Kente', slug: 'kente', image: { url: '/demo-assets/kitango-03.svg' } },
          { _id: 'category-4', name: 'Other Prints', slug: 'other-prints', image: { url: '/demo-assets/kitango-04.svg' } },
        ],
      };
    } else if (path === '/designs') {
      body = {
        success: true,
        data: [{ _id: 'design-1', slug: 'verified-design', name: 'Verified Design', designCode: 'VD-01', shortDescription: 'API-backed design', category: { name: 'Java' }, images: [{ url: '/demo-assets/kitango-01.svg', alt: 'Demo fabric design' }] }],
        pagination: { total: 1, page: 1, limit: 12, pages: 1 },
      };
    } else if (path.startsWith('/content/homepage_hero')) {
      status = 404;
      body = { success: false, message: 'Content not found.' };
    } else if (path === '/content') {
      body = { success: true, data: {} };
    } else if (path === '/enquiries' && request.method() === 'POST') {
      body = { success: true, message: 'Enquiry received.', referenceId: 'ENQ-TEST-1' };
    } else if (path === '/custom-requests' && request.method() === 'POST') {
      body = { success: true, message: 'Custom artwork received.' };
    } else if (path.startsWith('/designs/')) {
      body = { success: true, data: { _id: 'design-1', slug: 'verified-design', name: 'Verified Design', designCode: 'VD-01', images: [] } };
    }

    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
}
