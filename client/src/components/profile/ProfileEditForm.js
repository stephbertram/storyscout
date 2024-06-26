import { useContext, useRef } from 'react'
import toast from 'react-hot-toast'
import * as Yup from 'yup'
import YupPassword from 'yup-password'
import { object, string } from 'yup'
import { Formik, Form, Field } from 'formik'
import { UserContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'

YupPassword(Yup)

// Edit Profile
const editSchema = object({
	username: string()
		.min(3, 'Username must be at least 3 characters long.')
		.max(20, 'Username must be 20 characters or less.'),

	email: string().email("Invalid email format.")
		.min(5, 'Email must be at least 5 characters long.')
		.max(40, 'Email must be 40 characters or less.'),

	_password_hash: string()
		.min(8, 'Password must be at least 8 characters long.')
		.matches(/[a-zA-Z0-9]/, 'Password should contain letters and numbers.')
		.minLowercase(1, 'Password must contain at least 1 lowercase letter.')
		.minUppercase(1, 'Password must contain at least 1 uppercase letter.')
		.minNumbers(1, 'Password must contain at least 1 number.')
		.minSymbols(1, 'Password must contain at least 1 special character.'),

	confirmPassword: string()
		.oneOf([Yup.ref('_password_hash'), null], 'Passwords must match.'),
})

const ProfileEditForm = () => {
    const { user, setUser } = useContext(UserContext)
    const navigate = useNavigate()
    const file = useRef(null)

    const handleSubmit = (event, values) => {
        event.preventDefault()
        // Filter out unchanged and unnecessary fields
        const changes = Object.keys(values).reduce((acc, key) => {
            if (values[key] && values[key] !== user[key] && key !== 'confirmPassword') {
                acc[key] = values[key]
            }
            return acc
        }, {})

        if (Object.keys(changes).length > 0) {
            const formData = new FormData(event.target)
            fetch(`/users/${user.id}`, {
                method: 'PATCH',
                body: formData,
            })
            .then((res) => {
                if (res.ok) {
                    return res.json().then((data) => {
                        setUser(data)  // Update user context
                        toast.success('Profile updated successfully.')
                    })       
                } else {
                    return res.json().then((errorObj) => toast.error(errorObj.Error))
                }
            })
            .catch(error => {
                console.error('Error:', error);
                toast.error('Failed to update profile.')
            })
            } else {
            toast.error('No changes detected.')
            }
        }

    const handleDelete = () => {
        fetch(`/users/${user.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((res) => {
            if (res.ok) {
                setUser(null)
                navigate('/')
                toast.success("Your account has been deleted.")
            } else {
                return res
                    .json()
                    .then((errorObj) => toast.error(errorObj.Error))
            }
        })
        .catch((error) => console.error('Error:', error))
    }
    

	return (
		<div className='edit-profile'>
			<div className='form-container'>
                <Formik 
                    initialValues = {{
                        username: user?.username,
                        profile_image: null,
                        email: user?.email,
                        _password_hash: '',
                        confirmPassword: ''
                    }}
                    validationSchema = {editSchema}
                    onSubmit = {handleSubmit}
                >
                    {({ values, errors, touched }) => (
                        <Form className='form' onSubmit={e => handleSubmit(e, values)}>
                            <label htmlFor="username">Username:</label>
                            <Field
                                type='text'
                                name='username'
                                placeholder='Username'
                                className='input'
                                autoComplete='username'
                            />
                            {errors.username && touched.username && (
                                <div className='error-message show'>
                                    {errors.username}
                                </div>
                            )}
                            <label htmlFor="profile_image"> Profile Picture (Optional):</label>
                            <input 
                                type='file' 
                                name='profile_image'
                                ref={file}
                                className='input'
                            />
                            <label htmlFor="email">Email:</label>
                            <Field
                                type='text'
                                name='email'
                                placeholder='Email'
                                className='input'
                                autoComplete='email'
                            />
                            {errors.email && touched.email && (
                                <div className='error-message show'>
                                    {errors.email}
                                </div>
                            )}
                            <label htmlFor="_password_hash">Password:</label>
                            <Field
                                type='password'
                                name='_password_hash'
                                placeholder='New Password'
                                className='input'
                                autoComplete='current-password'
                            />
                            {errors._password_hash &&
                                touched._password_hash && (
                                    <div className='error-message show'>
                                        {errors._password_hash}
                                    </div>
                            )}
                            <Field
                                type='password'
                                name='confirmPassword'
                                placeholder='Confirm New Password'
                                className='input'
                            />
                            {errors.confirmPassword &&
                                touched.confirmPassword && (
                                    <div className='error-message show'>
                                        {errors.confirmPassword}
                                    </div>
                            )}
                            <input type='submit' className='submit' value='Submit Changes' />
                        </Form>
                    )}
                </Formik>
                <button onClick={handleDelete}>Delete Account</button>
            </div>
            <div className='profile-image-container'>
                <img src={user.profile_image} alt='profile'/>
            </div>
		</div>
    )
}

export default ProfileEditForm