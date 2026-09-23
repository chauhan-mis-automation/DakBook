export const SENDER_DEFAULTS = {
  sender_name: 'JEEWAN JYOTI AYURVEDIC SANSTHAN',
  sender_address: 'OFFICE NO 585, MAHAKAL PARKING, NANGLOI, DELHI 110041',
  sender_phone: '',
}

export const EMPTY_SHIPMENT = {
  barcode_no: '', order_id: '', biller_id: '', non_bnpl_code: '',
  weight: '', medicine: '',
  receiver_name: '', care_of: '', address: '', near_by_landmark: '',
  post: '', tehsil: '', district: '', state: '', pincode: '',
  mobile_no: '', alternate_number: '',
  cod_amount: '', amount_in_words: '',
  ...SENDER_DEFAULTS,
  status: 'pending',
}

export const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'printed', label: 'Printed' },
  { value: 'dispatched', label: 'Dispatched' },
]

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
  'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal',
]
