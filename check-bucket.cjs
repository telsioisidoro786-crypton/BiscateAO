const { createClient } = require('@supabase/supabase-js');

async function checkBucket() {
  const supabase = createClient(
    'https://djutlpchhyvciktthhhx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqdXRscGNoaHl2Y2lrdGRoaGh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDExMjA1NiwiZXhwIjoyMTA1Njg4MDU2fQ.f9rp4FzWV6i60ISmY1FxU8SVhYNidANb1xwP1L3o2_Q'
  );
  
  const { data, error } = await supabase.storage.from('BiscateAO').list('avatars');
  console.log('Files:', data);
  console.log('Error:', error);
  
  // Test upload
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('BiscateAO')
    .upload('avatars/test-upload.jpg', Buffer.from('test'), {
      contentType: 'image/jpeg',
      upsert: true
    });
  console.log('Upload:', uploadData, uploadError);
  
  // Get public URL
  const { data: urlData } = await supabase.storage.from('BiscateAO').getPublicUrl('avatars/test-upload.jpg');
  console.log('Public URL:', urlData.publicUrl);
}

checkBucket().catch(console.error);