export default function Privacy() {
  return (
    <div class="mt-7 flex flex-col items-center gap-5 justify-center md:flex-row md:gap-20">
      <div class="bg-green-100 p-4 rounded-md max-w-80 ">
        <h3 class="font-medium mb-2 text-xl">Data Security</h3>
        <ul>
          <li className="text-gray-600">
            We prioritize your data security. We use robust encryption and
            access controls to protect your M-Pesa statement information from
            unauthorized access.
          </li>
        </ul>
      </div>
      <div class="bg-green-100 p-4 rounded-md max-w-80">
        <h3 class="font-medium mb-2 text-xl">Temporary Storage</h3>
        <ul>
          <li className="text-gray-600">
            Your data is only stored temporarily on our secure servers during
            the analysis process. We do not retain any data beyond what is
            necessary to generate your insights..
          </li>
        </ul>
      </div>
      <div class="bg-green-100 p-4 rounded-md max-w-80">
        <h3 class="font-medium mb-2 text-xl ">You're in Control</h3>
        <ul>
          <li className="text-gray-600">
            You have full control over your data. You can end your session at
            any time, and all your uploaded data will be permanently deleted
            from our servers.
          </li>
        </ul>
      </div>
    </div>
  );
}
